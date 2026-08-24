create table public.group_invite_links (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  token uuid not null default gen_random_uuid() unique,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  expires_at timestamptz not null default (now() + interval '7 days'),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (revoked_at is null or revoked_at >= created_at)
);

create index group_invite_links_group_id_index
  on public.group_invite_links (group_id, expires_at desc);

alter table public.group_invite_links enable row level security;

create policy "Admins can view group invite links"
on public.group_invite_links for select to authenticated
using (public.is_group_admin(group_id));

create policy "Admins can create group invite links"
on public.group_invite_links for insert to authenticated
with check (created_by = auth.uid() and public.is_group_admin(group_id));

create policy "Admins can revoke group invite links"
on public.group_invite_links for update to authenticated
using (public.is_group_admin(group_id))
with check (public.is_group_admin(group_id));

create function public.get_group_invitation_preview(invitation_id uuid)
returns table (
  id uuid,
  group_id uuid,
  group_name text,
  expires_at timestamptz,
  invite_type text
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  select
    invite.id,
    invite.group_id,
    groups.name,
    invite.expires_at,
    'email'::text
  from public.group_invites invite
  join public.groups on groups.id = invite.group_id
  where invite.id = invitation_id
    and invite.status = 'pending'
    and invite.expires_at > now()
    and invite.email = lower(coalesce(auth.jwt() ->> 'email', ''));
end;
$$;

create function public.get_group_invite_link_preview(invite_token uuid)
returns table (
  id uuid,
  group_id uuid,
  group_name text,
  expires_at timestamptz,
  invite_type text
)
language plpgsql
security definer set search_path = public
as $$
begin
  return query
  select
    links.id,
    links.group_id,
    groups.name,
    links.expires_at,
    'link'::text
  from public.group_invite_links links
  join public.groups on groups.id = links.group_id
  where links.token = invite_token
    and links.revoked_at is null
    and links.expires_at > now();
end;
$$;

create function public.accept_group_invite_link(invite_token uuid)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  invite_link public.group_invite_links;
begin
  select * into invite_link
  from public.group_invite_links
  where token = invite_token
  for update;

  if not found or invite_link.revoked_at is not null or invite_link.expires_at <= now() then
    raise exception 'Invitation link is invalid or expired';
  end if;

  insert into public.group_members (group_id, user_id)
  values (invite_link.group_id, auth.uid())
  on conflict (group_id, user_id) do nothing;

  return invite_link.group_id;
end;
$$;

create function public.create_group_invite_link(target_group_id uuid)
returns table (id uuid, token uuid, expires_at timestamptz)
language plpgsql
security definer set search_path = public
as $$
declare
  active_link public.group_invite_links;
begin
  if not public.is_group_admin(target_group_id) then
    raise exception 'Forbidden';
  end if;

  perform 1 from public.groups where groups.id = target_group_id for update;

  select * into active_link
  from public.group_invite_links
  where group_id = target_group_id
    and revoked_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if found then
    return query select active_link.id, active_link.token, active_link.expires_at;
    return;
  end if;

  update public.group_invite_links
  set revoked_at = now()
  where group_id = target_group_id
    and revoked_at is null;

  return query
  insert into public.group_invite_links (group_id, created_by)
  values (target_group_id, auth.uid())
  returning group_invite_links.id, group_invite_links.token, group_invite_links.expires_at;
end;
$$;

create function public.decline_group_invitation(invitation_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  invitation public.group_invites;
begin
  select * into invitation
  from public.group_invites
  where id = invitation_id
  for update;

  if not found
    or invitation.status <> 'pending'
    or invitation.expires_at <= now()
    or invitation.email <> lower(coalesce(auth.jwt() ->> 'email', '')) then
    raise exception 'Invitation is invalid or expired';
  end if;

  update public.group_invites
  set status = 'revoked'
  where id = invitation.id;
end;
$$;

grant select, insert, update on table public.group_invite_links to authenticated;
grant execute on function public.get_group_invitation_preview(uuid) to authenticated;
grant execute on function public.get_group_invite_link_preview(uuid) to authenticated;
grant execute on function public.accept_group_invite_link(uuid) to authenticated;
grant execute on function public.create_group_invite_link(uuid) to authenticated;
grant execute on function public.decline_group_invitation(uuid) to authenticated;

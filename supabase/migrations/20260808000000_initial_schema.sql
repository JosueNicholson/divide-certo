create extension if not exists pgcrypto;

create type public.group_role as enum ('admin', 'member');
create type public.bill_split_type as enum ('equal', 'percentage', 'amount');
create type public.group_invite_status as enum ('pending', 'accepted', 'revoked', 'expired');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 1 and 80),
  email text not null unique check (email = lower(email)),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 120),
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  role public.group_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  email text not null check (email = lower(email)),
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  status public.group_invite_status not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references public.profiles (id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  check (
    (status = 'accepted' and accepted_by is not null and accepted_at is not null)
    or (status <> 'accepted' and accepted_by is null and accepted_at is null)
  )
);

create unique index group_invites_pending_email_key
  on public.group_invites (group_id, email)
  where status = 'pending';

create table public.bills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  created_by uuid not null default auth.uid() references public.profiles (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  description text check (char_length(description) <= 1000),
  total_cents bigint not null check (total_cents between 1 and 999999999),
  currency_code char(3) not null default 'BRL' check (currency_code = upper(currency_code)),
  split_type public.bill_split_type not null default 'equal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bills_group_created_at_index on public.bills (group_id, created_at desc);

create table public.bill_participants (
  bill_id uuid not null references public.bills (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete restrict,
  percentage_basis_points integer,
  amount_cents bigint,
  created_at timestamptz not null default now(),
  primary key (bill_id, user_id),
  check (percentage_basis_points is null or percentage_basis_points between 0 and 10000),
  check (amount_cents is null or amount_cents between 0 and 999999999),
  check (not (percentage_basis_points is not null and amount_cents is not null))
);

create index bill_participants_user_id_index on public.bill_participants (user_id);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

create trigger bills_set_updated_at
before update on public.bills
for each row execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1),
      'Usuário'
    ),
    lower(new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id and user_id = auth.uid()
  );
$$;

create function public.is_group_admin(target_group_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = target_group_id
      and user_id = auth.uid()
      and role = 'admin'
  );
$$;

create function public.shares_group_with(target_user_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.group_members current_member
    join public.group_members target_member
      on target_member.group_id = current_member.group_id
    where current_member.user_id = auth.uid()
      and target_member.user_id = target_user_id
  );
$$;

create function public.can_manage_bill(target_bill_id uuid)
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (
    select 1
    from public.bills
    where id = target_bill_id
      and (created_by = auth.uid() or public.is_group_admin(group_id))
  );
$$;

create function public.add_group_creator_as_admin()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.group_members (group_id, user_id, role)
  values (new.id, new.created_by, 'admin');
  return new;
end;
$$;

create trigger on_group_created
after insert on public.groups
for each row execute function public.add_group_creator_as_admin();

create function public.prevent_last_admin_removal()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if not exists (select 1 from public.groups where id = old.group_id) then
    return old;
  end if;

  if old.role = 'admin'
    and (tg_op = 'DELETE' or new.role <> 'admin')
    and (select count(*) from public.group_members where group_id = old.group_id and role = 'admin') <= 1 then
    raise exception 'A group must have at least one administrator';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger group_members_keep_an_admin
before update or delete on public.group_members
for each row execute function public.prevent_last_admin_removal();

create function public.prevent_bill_owner_or_group_change()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.group_id <> old.group_id or new.created_by <> old.created_by then
    raise exception 'The bill group and creator cannot be changed';
  end if;
  return new;
end;
$$;

create trigger bills_prevent_owner_or_group_change
before update on public.bills
for each row execute function public.prevent_bill_owner_or_group_change();

create function public.validate_bill_participant()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  current_split_type public.bill_split_type;
  bill_total_cents bigint;
  bill_group_id uuid;
  current_total bigint;
begin
  select split_type, total_cents, group_id
    into current_split_type, bill_total_cents, bill_group_id
    from public.bills
    where id = new.bill_id;

  if not found then
    raise exception 'Bill not found';
  end if;

  if not exists (
    select 1 from public.group_members
    where group_id = bill_group_id and user_id = new.user_id
  ) then
    raise exception 'A bill participant must be a current group member';
  end if;

  if current_split_type = 'equal' then
    if new.percentage_basis_points is not null or new.amount_cents is not null then
      raise exception 'Equal splits cannot have individual values';
    end if;
  elsif current_split_type = 'percentage' then
    if new.percentage_basis_points is null or new.amount_cents is not null then
      raise exception 'Percentage splits require only a percentage value';
    end if;

    select coalesce(sum(percentage_basis_points), 0)
      into current_total
      from public.bill_participants
      where bill_id = new.bill_id and user_id <> new.user_id;

    if current_total + new.percentage_basis_points > 10000 then
      raise exception 'The total percentage cannot exceed 100';
    end if;
  else
    if new.amount_cents is null or new.percentage_basis_points is not null then
      raise exception 'Amount splits require only an amount value';
    end if;

    select coalesce(sum(amount_cents), 0)
      into current_total
      from public.bill_participants
      where bill_id = new.bill_id and user_id <> new.user_id;

    if current_total + new.amount_cents > bill_total_cents then
      raise exception 'The total specific amount cannot exceed the bill total';
    end if;
  end if;

  return new;
end;
$$;

create trigger bill_participants_validate
before insert or update on public.bill_participants
for each row execute function public.validate_bill_participant();

create function public.accept_group_invitation(invitation_id uuid)
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

  insert into public.group_members (group_id, user_id)
  values (invitation.group_id, auth.uid())
  on conflict (group_id, user_id) do nothing;

  update public.group_invites
  set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
  where id = invitation.id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.bills enable row level security;
alter table public.bill_participants enable row level security;

create policy "Profiles are visible to their owner and group peers"
on public.profiles for select to authenticated
using (id = auth.uid() or public.shares_group_with(id));

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can view their groups"
on public.groups for select to authenticated
using (public.is_group_member(id));

create policy "Users can create groups"
on public.groups for insert to authenticated
with check (created_by = auth.uid());

create policy "Admins can update groups"
on public.groups for update to authenticated
using (public.is_group_admin(id))
with check (public.is_group_admin(id));

create policy "Admins can delete groups"
on public.groups for delete to authenticated
using (public.is_group_admin(id));

create policy "Members can view group members"
on public.group_members for select to authenticated
using (public.is_group_member(group_id));

create policy "Admins can add group members"
on public.group_members for insert to authenticated
with check (public.is_group_admin(group_id));

create policy "Admins can update group members"
on public.group_members for update to authenticated
using (public.is_group_admin(group_id))
with check (public.is_group_admin(group_id));

create policy "Admins can remove group members"
on public.group_members for delete to authenticated
using (public.is_group_admin(group_id));

create policy "Admins and invited people can view invitations"
on public.group_invites for select to authenticated
using (
  public.is_group_admin(group_id)
  or email = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Admins can create invitations"
on public.group_invites for insert to authenticated
with check (created_by = auth.uid() and public.is_group_admin(group_id));

create policy "Admins can update invitations"
on public.group_invites for update to authenticated
using (public.is_group_admin(group_id))
with check (public.is_group_admin(group_id));

create policy "Admins can delete invitations"
on public.group_invites for delete to authenticated
using (public.is_group_admin(group_id));

create policy "Members can view group bills"
on public.bills for select to authenticated
using (public.is_group_member(group_id));

create policy "Members can create bills"
on public.bills for insert to authenticated
with check (created_by = auth.uid() and public.is_group_member(group_id));

create policy "Bill creators and admins can update bills"
on public.bills for update to authenticated
using (public.can_manage_bill(id))
with check (public.is_group_member(group_id));

create policy "Bill creators and admins can delete bills"
on public.bills for delete to authenticated
using (public.can_manage_bill(id));

create policy "Members can view bill participants"
on public.bill_participants for select to authenticated
using (
  exists (
    select 1 from public.bills
    where bills.id = bill_participants.bill_id
      and public.is_group_member(bills.group_id)
  )
);

create policy "Bill creators and admins can add participants"
on public.bill_participants for insert to authenticated
with check (public.can_manage_bill(bill_id));

create policy "Bill creators and admins can update participants"
on public.bill_participants for update to authenticated
using (public.can_manage_bill(bill_id))
with check (public.can_manage_bill(bill_id));

create policy "Bill creators and admins can remove participants"
on public.bill_participants for delete to authenticated
using (public.can_manage_bill(bill_id));

grant execute on function public.accept_group_invitation(uuid) to authenticated;

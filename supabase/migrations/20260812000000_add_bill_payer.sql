alter table public.bills
add column paid_by uuid references public.profiles (id) on delete restrict;

create function public.validate_bill_payer()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.paid_by is not null and not exists (
    select 1
    from public.bill_participants
    where bill_id = new.id and user_id = new.paid_by
  ) then
    raise exception 'The bill payer must be a participant';
  end if;

  return new;
end;
$$;

create trigger bills_validate_payer
before insert or update of paid_by on public.bills
for each row execute function public.validate_bill_payer();

create function public.prevent_bill_payer_removal()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.bills
    where id = old.bill_id and paid_by = old.user_id
  ) then
    raise exception 'The bill payer must remain a participant';
  end if;

  return old;
end;
$$;

create trigger bill_participants_keep_payer
before delete on public.bill_participants
for each row execute function public.prevent_bill_payer_removal();

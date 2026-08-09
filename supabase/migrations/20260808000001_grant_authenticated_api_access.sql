grant usage on schema public to authenticated;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.groups to authenticated;
grant select, insert, update, delete on table public.group_members to authenticated;
grant select, insert, update, delete on table public.group_invites to authenticated;
grant select, insert, update, delete on table public.bills to authenticated;
grant select, insert, update, delete on table public.bill_participants to authenticated;

-- Admin foundation: allow editor/admin product metadata updates.

grant update on public.products to authenticated;

drop policy if exists products_update_roles on public.products;
create policy products_update_roles
on public.products
for update
to authenticated
using (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
)
with check (
  exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and profile.role in ('admin', 'editor')
  )
);

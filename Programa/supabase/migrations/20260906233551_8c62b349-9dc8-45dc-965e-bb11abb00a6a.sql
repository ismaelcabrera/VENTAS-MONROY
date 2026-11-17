create or replace function public.register_sale_movement()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.products p where p.id = new.product_id) then
    insert into public.inventory_movements (product_id, delta, kind, note)
    values (new.product_id, -new.qty, 'venta', 'Pedido ' || left(new.order_id::text, 8));
  end if;
  return new;
end;
$$;

create trigger order_items_register_sale after insert on public.order_items
for each row execute function public.register_sale_movement();

create or replace function public.claim_admin()
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  if exists (select 1 from public.user_roles where role = 'admin') then
    return public.has_role(auth.uid(), 'admin');
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
  on conflict do nothing;
  return true;
end;
$$;

revoke execute on function public.claim_admin() from anon, public;
grant execute on function public.claim_admin() to authenticated;
create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Users can read own roles" on public.user_roles
for select to authenticated using (auth.uid() = user_id);
create policy "Admins can read all roles" on public.user_roles
for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles" on public.user_roles
for all to authenticated using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create table public.products (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price integer not null default 0,
  cost integer not null default 0,
  unit text not null default 'unidad',
  sku text,
  image_key text,
  stock integer not null default 0,
  min_stock integer not null default 5,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

create policy "Anyone can view active products" on public.products
for select to anon, authenticated using (active or public.has_role(auth.uid(), 'admin'));
create policy "Admins insert products" on public.products
for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins update products" on public.products
for update to authenticated using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products
for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  delta integer not null,
  kind text not null default 'ajuste',
  note text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index inventory_movements_product_idx on public.inventory_movements(product_id);
grant select, insert on public.inventory_movements to authenticated;
grant all on public.inventory_movements to service_role;
alter table public.inventory_movements enable row level security;

create policy "Admins read movements" on public.inventory_movements
for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins insert movements" on public.inventory_movements
for insert to authenticated with check (public.has_role(auth.uid(), 'admin') and created_by = auth.uid());

create or replace function public.apply_movement()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.products
     set stock = greatest(0, stock + new.delta), updated_at = now()
   where id = new.product_id;
  return new;
end;
$$;
create trigger inventory_movements_apply after insert on public.inventory_movements
for each row execute function public.apply_movement();

create policy "Admins view all orders" on public.orders
for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders
for update to authenticated using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins view all order items" on public.order_items
for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins view all profiles" on public.profiles
for select to authenticated using (public.has_role(auth.uid(), 'admin'));
grant update on public.orders to authenticated;

insert into public.products (id, name, category, description, price, cost, unit, sku, image_key, stock, min_stock) values
('aceitunas-verdes','Aceitunas Verdes con Hierbas','Aceitunas','Aliñadas con romero y ajo, directas del barril.',4990,3200,'500 g','ACE-VER-500','aceitunas-verdes',40,8),
('aceitunas-negras','Aceitunas Negras Kalamata','Aceitunas','En aceite de oliva, suaves y con carácter.',5490,3600,'500 g','ACE-NEG-500','aceitunas-negras',28,8),
('mani-salado','Maní Salado Tostado','Maní','Tostado en casa, crocante y con la sal justa.',2990,1700,'500 g','MAN-SAL-500','mani-salado',60,10),
('mani-confitado','Maní Confitado al Caramelo','Maní','Bañado en caramelo ámbar, dulce y crujiente.',3490,2000,'400 g','MAN-CON-400','mani-confitado',18,10),
('mix-confites','Mix de Confites Surtidos','Confites','Gomitas y grageas de colores para compartir.',3990,2300,'500 g','CON-MIX-500','mix-confites',7,10),
('almendras-chocolate','Almendras con Chocolate','Confites','Chocolate amargo y un toque de cacao en polvo.',5990,4100,'400 g','CON-ALM-400','almendras-chocolate',22,6);
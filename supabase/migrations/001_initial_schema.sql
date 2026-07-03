-- ============================================================
-- Royal Rich Cafe — Initial Database Schema
-- ============================================================

-- 1. Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer','chef','admin')),
  created_at timestamptz default now()
);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  display_order int not null default 0,
  created_at timestamptz default now()
);

-- 3. Food Items
create table food_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories(id) on delete restrict,
  name text not null,
  description text,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz default now()
);

-- 4. Food Item Prices (per size)
create table food_item_prices (
  id uuid primary key default gen_random_uuid(),
  food_item_id uuid not null references food_items(id) on delete cascade,
  size text not null check (size in ('small','medium','large')),
  price numeric(10,2) not null check (price >= 0),
  unique (food_item_id, size)
);

-- 5. Advertisements
create table advertisements (
  id uuid primary key default gen_random_uuid(),
  food_item_id uuid not null references food_items(id) on delete cascade,
  title text not null,
  subtitle text,
  banner_image_url text,
  display_order int not null default 0,
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now()
);

-- 6. Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references profiles(id),
  guest_name text,
  guest_phone text,
  order_type text not null check (order_type in ('dine_in','takeaway','delivery')),
  table_number text,
  delivery_address text,
  status text not null default 'pending'
    check (status in ('pending','confirmed','preparing','ready','completed','cancelled')),
  cancellation_reason text,
  total_amount numeric(10,2) not null default 0,
  tracking_token uuid not null default gen_random_uuid(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. Order Items
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  food_item_id uuid not null references food_items(id),
  size text not null check (size in ('small','medium','large')),
  quantity int not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  subtotal numeric(10,2) not null
);

-- ============================================================
-- Triggers
-- ============================================================

-- Auto-update orders.updated_at on any change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- Recompute orders.total_amount from order_items
create or replace function recompute_order_total()
returns trigger as $$
declare
  target_order_id uuid;
begin
  if tg_op = 'DELETE' then
    target_order_id := old.order_id;
  else
    target_order_id := new.order_id;
  end if;

  update orders
  set total_amount = coalesce(
    (select sum(subtotal) from order_items where order_id = target_order_id),
    0
  )
  where id = target_order_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger order_items_total_sync
  after insert or update or delete on order_items
  for each row execute function recompute_order_total();

-- ============================================================
-- Helper: get user role from JWT
-- ============================================================
create or replace function get_user_role()
returns text as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer;

-- ============================================================
-- Row Level Security
-- ============================================================

-- profiles
alter table profiles enable row level security;

create policy "Users can read own profile"
  on profiles for select using (id = auth.uid());

create policy "Users can update own profile"
  on profiles for update using (id = auth.uid())
  with check (
    id = auth.uid()
    and (role = (select role from profiles where id = auth.uid()))
  );

create policy "Admins can read all profiles"
  on profiles for select using (get_user_role() = 'admin');

create policy "Admins can update any profile"
  on profiles for update using (get_user_role() = 'admin');

-- categories (public read, admin write)
alter table categories enable row level security;

create policy "Anyone can read categories"
  on categories for select using (true);

create policy "Admins can manage categories"
  on categories for all using (get_user_role() = 'admin');

-- food_items (public read, admin write)
alter table food_items enable row level security;

create policy "Anyone can read food items"
  on food_items for select using (true);

create policy "Admins can manage food items"
  on food_items for all using (get_user_role() = 'admin');

-- food_item_prices (public read, admin write)
alter table food_item_prices enable row level security;

create policy "Anyone can read prices"
  on food_item_prices for select using (true);

create policy "Admins can manage prices"
  on food_item_prices for all using (get_user_role() = 'admin');

-- advertisements (public read active, admin write)
alter table advertisements enable row level security;

create policy "Anyone can read active advertisements"
  on advertisements for select using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  );

create policy "Admins can read all advertisements"
  on advertisements for select using (get_user_role() = 'admin');

create policy "Admins can manage advertisements"
  on advertisements for all using (get_user_role() = 'admin');

-- orders
alter table orders enable row level security;

create policy "Customers can read own orders"
  on orders for select using (
    customer_id = auth.uid()
    or get_user_role() in ('admin','chef')
  );

create policy "Anyone can read order by tracking token"
  on orders for select using (true);

create policy "Anyone can create orders"
  on orders for insert with check (true);

create policy "Admins can manage orders"
  on orders for update using (get_user_role() = 'admin');

create policy "Admins can delete orders"
  on orders for delete using (get_user_role() = 'admin');

create policy "Chefs can update order status"
  on orders for update using (get_user_role() = 'chef')
  with check (
    status in ('confirmed','preparing','ready')
  );

-- order_items
alter table order_items enable row level security;

create policy "Users can read own order items"
  on order_items for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
        and (orders.customer_id = auth.uid() or get_user_role() in ('admin','chef'))
    )
  );

create policy "Anyone can read order items by tracking token"
  on order_items for select using (true);

create policy "Anyone can insert order items"
  on order_items for insert with check (true);

create policy "Admins can manage order items"
  on order_items for all using (get_user_role() = 'admin');

-- ============================================================
-- Enable Realtime for orders table
-- ============================================================
alter publication supabase_realtime add table orders;

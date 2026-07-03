-- 1. Enable RLS on all tables
alter table categories enable row level security;
alter table food_items enable row level security;
alter table food_item_prices enable row level security;
alter table advertisements enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table profiles enable row level security;

-- 2. Clean up existing policies if any (to prevent duplicates)
drop policy if exists "Anyone can read categories" on categories;
drop policy if exists "Admins can manage categories" on categories;
drop policy if exists "Anyone can read food items" on food_items;
drop policy if exists "Admins can manage food items" on food_items;
drop policy if exists "Anyone can read prices" on food_item_prices;
drop policy if exists "Admins can manage prices" on food_item_prices;
drop policy if exists "Anyone can read active advertisements" on advertisements;
drop policy if exists "Admins can read all advertisements" on advertisements;
drop policy if exists "Admins can manage advertisements" on advertisements;
drop policy if exists "Customers can read own orders" on orders;
drop policy if exists "Anyone can read order by tracking token" on orders;
drop policy if exists "Anyone can create orders" on orders;
drop policy if exists "Admins can manage orders" on orders;
drop policy if exists "Admins can delete orders" on orders;
drop policy if exists "Chefs can update order status" on orders;
drop policy if exists "Users can read own order items" on order_items;
drop policy if exists "Anyone can read order items by tracking token" on order_items;
drop policy if exists "Anyone can insert order items" on order_items;
drop policy if exists "Admins can manage order items" on order_items;
drop policy if exists "Users can read own profile" on profiles;
drop policy if exists "Users can update own profile" on profiles;
drop policy if exists "Admins can read all profiles" on profiles;
drop policy if exists "Admins can update any profile" on profiles;

-- 3. Profiles
create policy "Users can read own profile" on profiles for select using (id = auth.uid());
create policy "Admins can read all profiles" on profiles for select using (get_user_role() = 'admin');

-- 4. Categories (Public read, Admin write)
create policy "Anyone can read categories" on categories for select using (true);
create policy "Admins manage categories" on categories for all using (get_user_role() = 'admin');

-- 5. Food Items (Public read, Admin write)
create policy "Anyone can read food items" on food_items for select using (true);
create policy "Admins manage food items" on food_items for all using (get_user_role() = 'admin');

-- 6. Food Item Prices
create policy "Anyone can read prices" on food_item_prices for select using (true);
create policy "Admins manage prices" on food_item_prices for all using (get_user_role() = 'admin');

-- 7. Advertisements
create policy "Anyone can read active advertisements" on advertisements for select using (active = true);
create policy "Admins manage advertisements" on advertisements for all using (get_user_role() = 'admin');

-- 8. Orders
-- Customers read their own or by token
create policy "Customers read own orders" on orders for select using (customer_id = auth.uid());
create policy "Anyone read order by tracking token" on orders for select using (true); -- Read-only access for tracking page
create policy "Anyone can insert orders" on orders for insert with check (true);
create policy "Admin read all orders" on orders for select using (get_user_role() = 'admin');
create policy "Chef read all orders" on orders for select using (get_user_role() = 'chef');

create policy "Admin manage orders" on orders for update using (get_user_role() = 'admin');
create policy "Chef update order status" on orders for update using (get_user_role() = 'chef');

-- 9. Order Items
create policy "Anyone read order items" on order_items for select using (true);
create policy "Anyone can insert order items" on order_items for insert with check (true);
create policy "Admin manage order items" on order_items for all using (get_user_role() = 'admin');

-- 10. Enable Realtime for orders
-- alter publication supabase_realtime add table orders; (Already added in schema 1)


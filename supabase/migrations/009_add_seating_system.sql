-- ============================================================
-- Royal Rich Cafe — Add Seating System to Reservations
-- ============================================================

alter table public.reservations
add column customer_id uuid references auth.users(id) on delete set null,
add column selected_seats text[] not null default '{}',
add column floor_number int not null default 1;

-- Users can view their own reservations
create policy "Users can view their own reservations" on public.reservations 
  for select using (auth.uid() = customer_id);

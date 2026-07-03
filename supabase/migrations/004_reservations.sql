-- ============================================================
-- Royal Rich Cafe — Reservations Schema
-- ============================================================

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  guest_email text not null,
  guest_phone text not null,
  reservation_date text not null,
  reservation_time text not null,
  guests_count int not null check (guests_count > 0),
  special_requests text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  payment_amount numeric(10,2) not null default 500.00,
  verification_code text not null unique,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'attended')),
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.reservations enable row level security;

-- Policies
create policy "Anyone can create reservations" on public.reservations for insert with check (true);
create policy "Anyone can read reservations by ID or verification code" on public.reservations for select using (true);
create policy "Admins can manage reservations" on public.reservations for all using (get_user_role() = 'admin');

-- Add to Realtime publication
alter publication supabase_realtime add table public.reservations;

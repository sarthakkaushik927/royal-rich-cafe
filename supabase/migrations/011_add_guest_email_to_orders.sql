-- ============================================================
-- Add guest_email to orders table
-- Allows linking guest orders to authenticated users by email
-- ============================================================

alter table orders add column if not exists guest_email text;

-- Add an RLS-friendly index for email-based lookups
create index if not exists orders_guest_email_idx on orders (guest_email);

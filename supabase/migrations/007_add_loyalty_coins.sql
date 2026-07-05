-- Add loyalty_coins to profiles
ALTER TABLE public.profiles
ADD COLUMN loyalty_coins integer NOT NULL DEFAULT 0;

-- Optional: update the user role enum in case it needs expansion (currently 'customer', 'chef', 'admin', we can add 'waiter' soon as requested)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check CHECK (role in ('customer','chef','admin','waiter'));

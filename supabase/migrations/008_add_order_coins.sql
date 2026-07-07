-- Add applied_coins and discount_amount to orders
ALTER TABLE public.orders
ADD COLUMN applied_coins integer NOT NULL DEFAULT 0,
ADD COLUMN discount_amount numeric NOT NULL DEFAULT 0;

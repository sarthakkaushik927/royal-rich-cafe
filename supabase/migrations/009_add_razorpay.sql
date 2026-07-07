-- Add app_settings table
CREATE TABLE IF NOT EXISTS public.app_settings (
  id integer PRIMARY KEY DEFAULT 1,
  payment_mode text NOT NULL DEFAULT 'mock' CHECK (payment_mode IN ('live', 'mock')),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure only one row exists
ALTER TABLE public.app_settings ADD CONSTRAINT single_row CHECK (id = 1);

-- Insert default value
INSERT INTO public.app_settings (id, payment_mode) VALUES (1, 'mock') ON CONFLICT (id) DO NOTHING;

-- Enable RLS for app_settings
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to app_settings
CREATE POLICY "Public can read app_settings"
  ON public.app_settings FOR SELECT
  USING (true);

-- Allow admin to update app_settings
CREATE POLICY "Admins can update app_settings"
  ON public.app_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Update orders table for Razorpay
ALTER TABLE public.orders
ADD COLUMN razorpay_order_id text,
ADD COLUMN razorpay_payment_id text,
ADD COLUMN razorpay_signature text,
ADD COLUMN payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD COLUMN payment_mode text NOT NULL DEFAULT 'mock' CHECK (payment_mode IN ('live', 'mock')),
ADD COLUMN currency text NOT NULL DEFAULT 'INR';

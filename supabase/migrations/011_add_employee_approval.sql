-- Add new columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected')),
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS avatar_url text;

-- Update trigger to handle requested roles and approval status
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_requested_role text;
  v_status text;
BEGIN
  v_requested_role := coalesce(new.raw_user_meta_data ->> 'requested_role', 'customer');
  
  -- If user requests employee roles, set to pending
  IF v_requested_role IN ('chef', 'waiter', 'admin') THEN
    v_status := 'pending';
  ELSE
    v_requested_role := 'customer';
    v_status := 'active';
  END IF;

  INSERT INTO public.profiles (id, full_name, role, status, address, avatar_url)
  VALUES (
    new.id, 
    new.raw_user_meta_data ->> 'full_name', 
    v_requested_role,
    v_status,
    new.raw_user_meta_data ->> 'address',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create storage bucket for avatars if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Anyone can upload an avatar." ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars');

-- Create restaurant_tables table
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number text NOT NULL UNIQUE,
    floor_number text,
    capacity integer DEFAULT 4,
    status text DEFAULT 'active',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up RLS
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active tables
CREATE POLICY "Public can view active tables"
    ON public.restaurant_tables FOR SELECT
    USING (status = 'active');

-- Allow admins full access
CREATE POLICY "Admins can manage tables"
    ON public.restaurant_tables FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

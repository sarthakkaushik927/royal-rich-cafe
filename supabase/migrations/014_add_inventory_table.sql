-- Create the updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create inventory table
CREATE TABLE inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  stock numeric(10,2) NOT NULL DEFAULT 0,
  min_stock numeric(10,2) NOT NULL DEFAULT 0,
  unit text NOT NULL,
  cost_per_unit numeric(10,2) NOT NULL DEFAULT 0,
  expiry date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Only admins can manage inventory
CREATE POLICY "Admins can view inventory"
  ON inventory FOR SELECT
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can insert inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can update inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

CREATE POLICY "Admins can delete inventory"
  ON inventory FOR DELETE
  USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert initial seed data
INSERT INTO inventory (name, category, min_stock, stock, unit, cost_per_unit, expiry) VALUES
('Italian Burrata', 'Dairy & Cheese', 5, 15, 'KG', 1200, '2028-07-15'),
('Kelp Caviar', 'Garnishes', 0.5, 4.2, 'KG', 8500, '2028-08-30'),
('Artichoke Hearts', 'Vegetables', 40, 120, 'PCS', 45, '2028-07-08'),
('Perigord Black Truffles', 'Garnishes', 0.3, 0.8, 'KG', 45000, '2028-07-20'),
('King Oyster Mushrooms', 'Vegetables', 8, 24, 'KG', 350, '2028-07-08'),
('Chateau Margaux 2015', 'Beverages', 10, 36, 'BOTTLES', 12000, '2036-12-31'),
('Edible 24k Gold Leaf', 'Garnishes', 20, 100, 'SHEETS', 180, '2029-01-01'),
('Acquerello Rice', 'Grains & Pasta', 10, 25, 'KG', 800, '2027-02-15');

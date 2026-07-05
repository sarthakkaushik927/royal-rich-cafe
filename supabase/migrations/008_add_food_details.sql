-- Add ingredients and preparation options to food items
ALTER TABLE food_items
ADD COLUMN ingredients TEXT[] DEFAULT '{}',
ADD COLUMN preparation_options TEXT[] DEFAULT '{}';

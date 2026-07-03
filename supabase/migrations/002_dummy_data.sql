-- Dummy Data for Royal Rich Cafe Menu

-- 1. Insert Categories
INSERT INTO categories (name, slug, display_order) VALUES
('Starters', 'starters', 1),
('Main Course', 'main-course', 2),
('Desserts', 'desserts', 3),
('Beverages', 'beverages', 4);

-- 2. Insert Food Items and Prices
DO $$
DECLARE
    cat_starters uuid;
    cat_mains uuid;
    cat_desserts uuid;
    cat_bevs uuid;
    item_id uuid;
BEGIN
    SELECT id INTO cat_starters FROM categories WHERE slug = 'starters';
    SELECT id INTO cat_mains FROM categories WHERE slug = 'main-course';
    SELECT id INTO cat_desserts FROM categories WHERE slug = 'desserts';
    SELECT id INTO cat_bevs FROM categories WHERE slug = 'beverages';

    -- Item 1: Truffle Fries
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_starters, 'Truffle Parmesan Fries', 'Crispy golden fries tossed in white truffle oil and aged parmesan cheese, served with garlic aioli.', 'https://images.unsplash.com/photo-1593504049359-715560b29c9e?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'medium', 450), (item_id, 'large', 600);

    -- Item 2: Wagyu Beef Sliders
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_starters, 'Wagyu Beef Sliders', 'Miniature premium wagyu beef patties with caramelized onions, cheddar, and house sauce on brioche buns.', 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'small', 850), (item_id, 'medium', 1250);

    -- Item 3: Saffron Lobster Risotto
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_mains, 'Saffron Lobster Risotto', 'Creamy Arborio rice infused with Spanish saffron, topped with butter-poached lobster tail and microgreens.', 'https://images.unsplash.com/photo-1633504581786-316c8002b1b9?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'medium', 2800);

    -- Item 4: Herb-Crusted Rack of Lamb
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_mains, 'Herb-Crusted Rack of Lamb', 'Oven-roasted rack of lamb with a rosemary-thyme crust, served with potato gratin and a red wine reduction.', 'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'medium', 3200);

    -- Item 5: Gold Leaf Chocolate Fondant
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_desserts, 'Gold Leaf Chocolate Fondant', 'Warm Belgian dark chocolate lava cake dusted with edible 24k gold, accompanied by Madagascar vanilla bean ice cream.', 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'medium', 950);

    -- Item 6: Royal Rich Signature Mocktail
    INSERT INTO food_items (category_id, name, description, image_url, is_available)
    VALUES (cat_bevs, 'Royal Rich Signature Blend', 'A refreshing blend of fresh passionfruit, elderflower syrup, sparkling water, and a hint of mint.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop', true)
    RETURNING id INTO item_id;
    INSERT INTO food_item_prices (food_item_id, size, price) VALUES (item_id, 'medium', 350), (item_id, 'large', 500);

    -- 3. Insert Advertisement
    INSERT INTO advertisements (title, subtitle, banner_image_url, food_item_id, active, display_order)
    VALUES ('Weekend Special: 15% Off Steaks', 'Experience our premium cuts cooked to absolute perfection. Valid every Friday and Saturday evening.', 'https://images.unsplash.com/photo-1544025162-83130bf7124e?q=80&w=1200&auto=format&fit=crop', item_id, true, 1);
    
    INSERT INTO advertisements (title, subtitle, food_item_id, active, display_order)
    VALUES ('Try Our New Signature Dessert', 'The Gold Leaf Chocolate Fondant is now available. Treat yourself to pure luxury.', item_id, true, 2);

END $$;

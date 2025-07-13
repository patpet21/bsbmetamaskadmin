-- Best Sicily Bottega - Supabase Database Schema
-- Run this script in your Supabase SQL Editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu items table
CREATE TABLE menu (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image VARCHAR(500),
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Extras table
CREATE TABLE extras (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  categories TEXT[] DEFAULT '{}', -- Array of category names
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders table  
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  delivery_address TEXT NOT NULL,
  menu_items JSONB NOT NULL, -- Store cart items as JSON
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'crypto', -- 'crypto' or 'card'
  transaction_hash VARCHAR(255),
  payment_token VARCHAR(10), -- For crypto: 'PRDX' or 'USDC'
  card_last4 VARCHAR(4), -- Last 4 digits of card
  card_brand VARCHAR(20), -- visa, mastercard, etc.
  discount_applied DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, icon) VALUES
('Pizza', '🍕'),
('Pasta', '🍝'),
('Dolci', '🍰'),
('Antipasti', '🥗');

-- Insert sample menu items
INSERT INTO menu (name, description, price, category_id, image) VALUES
-- Pizza
('Pizza Margherita', 'Classic tomato base with fresh mozzarella and basil', 12.99, 1, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400'),
('Pizza Napoletana', 'Traditional Neapolitan style with anchovies and oregano', 14.99, 1, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400'),
('Pizza Quattro Stagioni', 'Four seasons pizza with artichokes, ham, mushrooms, and olives', 16.99, 1, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400'),
('Pizza Diavola', 'Spicy salami with chili peppers and mozzarella', 15.99, 1, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400'),

-- Pasta
('Spaghetti Carbonara', 'Classic Roman pasta with eggs, pancetta, and pecorino', 13.99, 2, 'https://images.unsplash.com/photo-1621996346565-e3dbc92d47bd?w=400'),
('Penne Arrabbiata', 'Spicy tomato sauce with garlic and chili', 11.99, 2, 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=400'),
('Fettuccine Alfredo', 'Creamy butter and parmesan sauce', 12.99, 2, 'https://images.unsplash.com/photo-1621647742200-ddaf38c0bf5d?w=400'),
('Lasagna della Casa', 'Traditional layered pasta with meat sauce and bechamel', 16.99, 2, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=400'),

-- Dolci
('Tiramisu', 'Classic coffee-flavored Italian dessert', 6.99, 3, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400'),
('Cannoli Siciliani', 'Traditional Sicilian pastry with ricotta filling', 5.99, 3, 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400'),
('Panna Cotta', 'Silky vanilla pudding with berry coulis', 5.99, 3, 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
('Gelato Misto', 'Selection of three artisanal gelato flavors', 7.99, 3, 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=400'),

-- Antipasti
('Bruschetta', 'Toasted bread with tomatoes, garlic, and basil', 8.99, 4, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400'),
('Antipasto Misto', 'Selection of cured meats, cheeses, and olives', 16.99, 4, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400'),
('Caprese', 'Fresh mozzarella with tomatoes and basil', 10.99, 4, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=400'),
('Arancini', 'Sicilian rice balls with ragù and mozzarella', 9.99, 4, 'https://images.unsplash.com/photo-1633504581786-316c8002489a?w=400');

-- Insert sample extras
INSERT INTO extras (name, price, categories) VALUES
('Extra Mozzarella', 2.99, ARRAY['Pizza', 'Pasta']),
('Prosciutto di Parma', 4.99, ARRAY['Pizza', 'Antipasti']),
('Mushrooms', 2.49, ARRAY['Pizza', 'Pasta']),
('Spicy Salami', 3.99, ARRAY['Pizza']),
('Extra Parmesan', 1.99, ARRAY['Pizza', 'Pasta']),
('Black Olives', 2.49, ARRAY['Pizza', 'Antipasti']),
('Sun-dried Tomatoes', 3.49, ARRAY['Pizza', 'Pasta', 'Antipasti']),
('Fresh Basil', 1.99, ARRAY['Pizza', 'Pasta', 'Antipasti']),
('Truffle Oil', 5.99, ARRAY['Pizza', 'Pasta']),
('Buffalo Mozzarella', 4.99, ARRAY['Pizza', 'Antipasti']);

-- Enable RLS policies (optional, for security)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read access
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu" ON menu FOR SELECT USING (true);
CREATE POLICY "Allow public read access to extras" ON extras FOR SELECT USING (true);

-- Allow public insert for orders (customers can place orders)
CREATE POLICY "Allow public insert to orders" ON orders FOR INSERT WITH CHECK (true);

-- Enable realtime for live updates (optional)
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE menu;
ALTER PUBLICATION supabase_realtime ADD TABLE extras;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
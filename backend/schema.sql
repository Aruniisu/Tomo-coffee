-- Create database
CREATE DATABASE IF NOT EXISTS tomos_coffee;
USE tomos_coffee;

-- Users table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- Products table
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    cost_price DECIMAL(10,2) NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0
);

-- Orders table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_sale DECIMAL(10,2) NOT NULL,
    cost_at_sale DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insert sample user (password: 'password123')
INSERT INTO users (username, password_hash) VALUES 
('cashier', '$2b$12$YourHashedPasswordHere');

-- Insert sample products
INSERT INTO products (name, price, cost_price, stock_quantity) VALUES
('Cappuccino', 4.50, 1.50, 50),
('Croissant', 3.00, 1.00, 30),
('Espresso', 4.50, 1.20, 40),
('Coffee', 2.50, 0.50, 60),
('Chocolate', 2.50, 0.80, 25),
('Yagvri', 3.00, 1.00, 20),
('Peppermint Tea', 2.00, 0.60, 35),
('Chocolate Cake', 4.00, 1.50, 15),
('Muffin', 3.50, 1.20, 20),
('Bagel', 3.50, 1.00, 25),
('Sandwich', 7.50, 3.00, 20),
('Salad', 9.00, 3.50, 15);
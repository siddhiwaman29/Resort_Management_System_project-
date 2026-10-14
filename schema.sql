-- Database Schema for Resort Management System
-- PostgreSQL Compatible

-- 1. Login / Admin table
CREATE TABLE IF NOT EXISTS login (
    id SERIAL PRIMARY KEY,
    usname VARCHAR(100) NOT NULL UNIQUE,
    pass VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'admin'
);

-- 2. Room Inventory Table
CREATE TABLE IF NOT EXISTS room (
    id SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL,        -- 'Superior Room', 'Deluxe Room', 'Guest House', 'Single Room'
    bedding VARCHAR(50) NOT NULL,     -- 'Single', 'Double', 'Triple', 'Quad', 'None'
    place VARCHAR(50) NOT NULL,       -- Room Number or Floor
    cusid INT DEFAULT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    status VARCHAR(50) DEFAULT 'Available', -- 'Available', 'Booked', 'Maintenance'
    image_url TEXT,
    description TEXT
);

-- 3. Room Bookings Table
CREATE TABLE IF NOT EXISTS roombook (
    id SERIAL PRIMARY KEY,
    title VARCHAR(20) NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    national VARCHAR(50) NOT NULL,    -- 'Indian', 'Non Indian'
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    troom VARCHAR(100) NOT NULL,      -- Room Type
    bed VARCHAR(50) NOT NULL,        -- Bedding Type
    nroom INT NOT NULL DEFAULT 1,
    meal VARCHAR(50) NOT NULL,       -- 'Room only', 'Breakfast', 'Half Board', 'Full Board'
    cin DATE NOT NULL,
    cout DATE NOT NULL,
    stat VARCHAR(50) DEFAULT 'Not Conform', -- 'Not Conform', 'Conform', 'Cancelled'
    nodays INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payment Table
CREATE TABLE IF NOT EXISTS payment (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES roombook(id) ON DELETE SET NULL,
    title VARCHAR(20) NOT NULL,
    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100) NOT NULL,
    troom VARCHAR(100) NOT NULL,
    tbed VARCHAR(50) NOT NULL,
    nroom INT NOT NULL DEFAULT 1,
    cin DATE NOT NULL,
    cout DATE NOT NULL,
    ttot NUMERIC(10, 2) NOT NULL,     -- Total Room cost
    fintot NUMERIC(10, 2) NOT NULL,   -- Final Total
    mepr NUMERIC(10, 2) NOT NULL,     -- Meal Price
    meal VARCHAR(50) NOT NULL,
    btot NUMERIC(10, 2) NOT NULL,     -- Bedding Extra
    noofdays INT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Card/UPI',
    payment_status VARCHAR(50) DEFAULT 'Paid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Contact Table
CREATE TABLE IF NOT EXISTS contact (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(150) NOT NULL,
    phone_no VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL,
    cdate DATE DEFAULT CURRENT_DATE,
    approval VARCHAR(50) DEFAULT 'Not Allowed',
    message TEXT
);

-- 6. Newsletter Subscription Table
CREATE TABLE IF NOT EXISTS newsletter (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150),
    subject VARCHAR(200),
    email VARCHAR(150) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Feedback Table (Resolved Limitation from Project Report)
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    fullname VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Restaurant & Food Menu Table
CREATE TABLE IF NOT EXISTS food_menu (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true
);

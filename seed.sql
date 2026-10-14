-- Initial Seed Data for Resort Management System

-- Admin & User login credentials (Admin: admin/admin123, User: user/user123, siddhi/siddhi123)
INSERT INTO login (usname, pass, role) 
VALUES 
  ('admin', 'admin123', 'admin'),
  ('user', 'user123', 'user'),
  ('siddhi', 'siddhi123', 'user')
ON CONFLICT (usname) DO NOTHING;


-- Rooms
INSERT INTO room (type, bedding, place, price, status, image_url, description) VALUES
('Superior Room', 'Single', 'Room 101', 3500.00, 'Available', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', 'Luxurious single superior room with private balcony and scenic garden view.'),
('Superior Room', 'Double', 'Room 102', 4500.00, 'Available', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'Spacious double bed superior room equipped with king-size bed and spa bath.'),
('Deluxe Room', 'Double', 'Room 201', 5500.00, 'Available', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', 'Elegant deluxe room featuring panoramic pool view, mini-bar, and workspace.'),
('Deluxe Room', 'Triple', 'Room 202', 6500.00, 'Available', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', 'Premium deluxe suite accommodating 3 guests with cozy lounge and complimentary drinks.'),
('Guest House', 'Quad', 'Villa 301', 9500.00, 'Available', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', 'Private luxury villa guest house with 4 beds, kitchenette, private pool and lawn.'),
('Single Room', 'Single', 'Room 105', 2200.00, 'Available', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', 'Compact modern single room perfect for solo travellers and business stays.')
ON CONFLICT DO NOTHING;

-- Food Menu Items
INSERT INTO food_menu (name, category, price, description, image_url) VALUES
('Continental Sunrise Breakfast', 'Breakfast', 350.00, 'Freshly baked croissants, eggs to order, fresh juices, and artisanal coffee.', 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80'),
('Traditional Indian Thali', 'Lunch', 450.00, 'Complete gourmet thali with paneer special, dal makhani, roti, pulao, and gulab jamun.', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80'),
('Grilled Herb Salmon / Paneer Tikka', 'Dinner', 650.00, 'Tender grilled cottage cheese or salmon with charred asparagus and lemon butter glaze.', 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'),
('Resort Signature Mocktail', 'Beverages', 220.00, 'Refreshing blend of blue curacao, lime, mint, and sparkling soda.', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'),
('Belgian Chocolate Lava Cake', 'Dessert', 280.00, 'Molten warm chocolate cake served with Madagascar vanilla bean ice cream.', 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80')
ON CONFLICT DO NOTHING;

-- Sample Bookings from the report screenshot
INSERT INTO roombook (title, fname, lname, email, national, country, phone, troom, bed, nroom, meal, cin, cout, stat, nodays) VALUES
('Miss.', 'Siddhi', 'Waman', 'siddhiwaman@gmail.com', 'Indian', 'India', '9876543210', 'Deluxe Room', 'Single', 1, 'Breakfast', '2024-03-30', '2024-03-31', 'Conform', 1),
('Miss.', 'Tanushka', 'Mald', 'tanushkamald@gmail.com', 'Indian', 'India', '9876543211', 'Deluxe Room', 'Triple', 1, 'Full Board', '2024-04-02', '2024-04-04', 'Conform', 2),
('Mr.', 'Vishal', 'Mungse', 'vishalmungse@gmail.com', 'Indian', 'India', '9876543212', 'Guest House', 'Double', 1, 'Half Board', '2024-04-12', '2024-04-18', 'Not Conform', 6),
('Mr.', 'Amol', 'Kharde', 'amolk harde@gmail.com', 'Indian', 'India', '9876543213', 'Guest House', 'Double', 1, 'Full Board', '2024-04-02', '2024-04-06', 'Not Conform', 4)
ON CONFLICT DO NOTHING;

-- Sample Feedback
INSERT INTO feedback (fullname, email, rating, comment) VALUES
('Rahul Sharma', 'rahul@example.com', 5, 'Amazing resort experience! The staff was courteous and rooms were sparkling clean.'),
('Pooja Patil', 'pooja@example.com', 5, 'The food at the restaurant was superb. Loved the swimming pool and serene environment.')
ON CONFLICT DO NOTHING;

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// PostgreSQL Pool configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'resort_db',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  connectionTimeoutMillis: 3000,
});

let isPostgresConnected = false;

// Mock In-Memory Store for fallback if PostgreSQL is not currently running
const mockStore = {
  login: [
    { id: 1, usname: 'admin', pass: 'admin123', role: 'admin' },
    { id: 2, usname: 'user', pass: 'user123', role: 'user' },
    { id: 3, usname: 'siddhi', pass: 'siddhi123', role: 'user' }
  ],

  room: [
    { id: 1, type: 'Superior Room', bedding: 'Single', place: 'Room 101', cusid: null, price: 3500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80', description: 'Luxurious single superior room with private balcony.' },
    { id: 2, type: 'Superior Room', bedding: 'Double', place: 'Room 102', cusid: null, price: 4500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', description: 'Spacious double bed superior room equipped with king-size bed.' },
    { id: 3, type: 'Deluxe Room', bedding: 'Double', place: 'Room 201', cusid: null, price: 5500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80', description: 'Elegant deluxe room featuring panoramic pool view.' },
    { id: 4, type: 'Deluxe Room', bedding: 'Triple', place: 'Room 202', cusid: null, price: 6500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80', description: 'Premium deluxe suite accommodating 3 guests with cozy lounge.' },
    { id: 5, type: 'Guest House', bedding: 'Quad', place: 'Villa 301', cusid: null, price: 9500, status: 'Available', image_url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80', description: 'Private luxury villa guest house with private pool and lawn.' },
    { id: 6, type: 'Single Room', bedding: 'Single', place: 'Room 105', cusid: null, price: 2200, status: 'Available', image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80', description: 'Compact modern single room perfect for solo travellers.' }
  ],
  roombook: [
    { id: 1, title: 'Miss.', fname: 'Siddhi', lname: 'Waman', email: 'siddhiwaman@gmail.com', national: 'Indian', country: 'India', phone: '9876543210', troom: 'Deluxe Room', bed: 'Single', nroom: 1, meal: 'Breakfast', cin: '2024-03-30', cout: '2024-03-31', stat: 'Conform', nodays: 1, created_at: new Date('2024-03-30') },
    { id: 2, title: 'Miss.', fname: 'Tanushka', lname: 'Mald', email: 'tanushkamald@gmail.com', national: 'Indian', country: 'India', phone: '9876543211', troom: 'Deluxe Room', bed: 'Triple', nroom: 1, meal: 'Full Board', cin: '2024-04-02', cout: '2024-04-04', stat: 'Conform', nodays: 2, created_at: new Date('2024-04-02') },
    { id: 3, title: 'Mr.', fname: 'Vishal', lname: 'Mungse', email: 'vishalmungse@gmail.com', national: 'Indian', country: 'India', phone: '9876543212', troom: 'Guest House', bed: 'Double', nroom: 1, meal: 'Half Board', cin: '2024-04-12', cout: '2024-04-18', stat: 'Not Conform', nodays: 6, created_at: new Date('2024-04-12') },
    { id: 4, title: 'Mr.', fname: 'Amol', lname: 'Kharde', email: 'amolk harde@gmail.com', national: 'Indian', country: 'India', phone: '9876543213', troom: 'Guest House', bed: 'Double', nroom: 1, meal: 'Full Board', cin: '2024-04-02', cout: '2024-04-06', stat: 'Not Conform', nodays: 4, created_at: new Date('2024-04-02') }
  ],
  payment: [
    { id: 1, booking_id: 1, title: 'Miss.', fname: 'Siddhi', lname: 'Waman', troom: 'Deluxe Room', tbed: 'Single', nroom: 1, cin: '2024-03-30', cout: '2024-03-31', ttot: 5500, fintot: 5850, mepr: 350, meal: 'Breakfast', btot: 0, noofdays: 1, payment_method: 'UPI', payment_status: 'Paid', created_at: new Date('2024-03-30') },
    { id: 2, booking_id: 2, title: 'Miss.', fname: 'Tanushka', lname: 'Mald', troom: 'Deluxe Room', tbed: 'Triple', nroom: 1, cin: '2024-04-02', cout: '2024-04-04', ttot: 13000, fintot: 14600, mepr: 1600, meal: 'Full Board', btot: 0, noofdays: 2, payment_method: 'Card', payment_status: 'Paid', created_at: new Date('2024-04-02') }
  ],
  contact: [
    { id: 1, fullname: 'Tanushka Maid', phone_no: '9876543211', email: 'tanushkamaid@gmail.com', cdate: '2024-03-30', approval: 'Allowed', message: 'Inquiry regarding group retreat packages.' }
  ],
  newsletter: [
    { id: 1, title: 'Summer Special', subject: '20% off on all villas', email: 'tanushkamaid@gmail.com', created_at: new Date() }
  ],
  feedback: [
    { id: 1, fullname: 'Rahul Sharma', email: 'rahul@example.com', rating: 5, comment: 'Amazing resort experience! The staff was courteous and rooms were sparkling clean.', created_at: new Date() },
    { id: 2, fullname: 'Pooja Patil', email: 'pooja@example.com', rating: 5, comment: 'The food at the restaurant was superb. Loved the swimming pool and serene environment.', created_at: new Date() }
  ],
  food_menu: [
    { id: 1, name: 'Continental Sunrise Breakfast', category: 'Breakfast', price: 350.00, description: 'Freshly baked croissants, eggs to order, fresh juices, and artisanal coffee.', image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80', is_available: true },
    { id: 2, name: 'Traditional Indian Thali', category: 'Lunch', price: 450.00, description: 'Complete gourmet thali with paneer special, dal makhani, roti, pulao, and gulab jamun.', image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80', is_available: true },
    { id: 3, name: 'Grilled Herb Salmon / Paneer Tikka', category: 'Dinner', price: 650.00, description: 'Tender grilled cottage cheese or salmon with charred asparagus and lemon butter glaze.', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80', is_available: true },
    { id: 4, name: 'Resort Signature Mocktail', category: 'Beverages', price: 220.00, description: 'Refreshing blend of blue curacao, lime, mint, and sparkling soda.', image_url: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80', is_available: true },
    { id: 5, name: 'Belgian Chocolate Lava Cake', category: 'Dessert', price: 280.00, description: 'Molten warm chocolate cake served with Madagascar vanilla bean ice cream.', image_url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', is_available: true }
  ]
};

// Auto initialize tables and seed data if connected to PostgreSQL
async function initializeDatabase() {
  try {
    const client = await pool.connect();
    isPostgresConnected = true;
    console.log('✅ Connected to PostgreSQL database successfully!');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ Database schema verified / created.');
    }

    // Read and run seed.sql if tables are empty
    const checkUsers = await client.query('SELECT COUNT(*) FROM login');
    if (parseInt(checkUsers.rows[0].count, 10) === 0) {
      const seedPath = path.join(__dirname, '..', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        await client.query(seedSql);
        console.log('✅ Seed data inserted successfully.');
      }
    }

    client.release();
  } catch (err) {
    isPostgresConnected = false;
    console.warn('\n⚠️ [Database Notice]: Could not connect to PostgreSQL server: ' + err.message);
    console.warn('👉 App is running smoothly with Mock Memory Store mode so you can test right now.');
    console.warn('👉 To connect real PostgreSQL: create database "resort_db" and verify credentials in .env file.\n');
  }
}

// Universal query helper
async function query(text, params = []) {
  if (isPostgresConnected) {
    return pool.query(text, params);
  }
  return null; // Signals controller to use memory store fallback
}

module.exports = {
  pool,
  query,
  mockStore,
  initializeDatabase,
  getIsConnected: () => isPostgresConnected
};

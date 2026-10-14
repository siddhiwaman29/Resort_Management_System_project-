const db = require('../config/db');

// Helper to determine rates
function getRates(troom, bed, meal) {
  let roomRate = 3500;
  if (troom === 'Superior Room') roomRate = 4000;
  else if (troom === 'Deluxe Room') roomRate = 5500;
  else if (troom === 'Guest House') roomRate = 9500;
  else if (troom === 'Single Room') roomRate = 2200;

  let bedExtra = 0;
  if (bed === 'Double') bedExtra = 300;
  else if (bed === 'Triple') bedExtra = 600;
  else if (bed === 'Quad') bedExtra = 1000;

  let mealRate = 0;
  if (meal === 'Breakfast') mealRate = 350;
  else if (meal === 'Half Board') mealRate = 800;
  else if (meal === 'Full Board') mealRate = 1400;

  return { roomRate, bedExtra, mealRate };
}

// 1. Process payment (simulated payment gateway)
exports.processPayment = async (req, res) => {
  try {
    const {
      booking_id, title, fname, lname,
      troom, tbed, nroom, cin, cout, noofdays, meal,
      payment_method
    } = req.body;

    const days = parseInt(noofdays, 10) || 1;
    const roomsCount = parseInt(nroom, 10) || 1;
    const { roomRate, bedExtra, mealRate } = getRates(troom, tbed, meal);

    const ttot = roomRate * days * roomsCount;
    const btot = bedExtra * days * roomsCount;
    const mepr = mealRate * days * roomsCount;
    const fintot = ttot + btot + mepr;
    const payMethod = payment_method || 'UPI / Online Card';

    if (db.getIsConnected()) {
      // 1. Insert payment record
      const insertQuery = `
        INSERT INTO payment 
        (booking_id, title, fname, lname, troom, tbed, nroom, cin, cout, ttot, fintot, mepr, meal, btot, noofdays, payment_method, payment_status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;
      const values = [
        booking_id || null, title, fname, lname, troom, tbed, roomsCount,
        cin, cout, ttot, fintot, mepr, meal, btot, days, payMethod, 'Paid'
      ];
      const result = await db.query(insertQuery, values);

      // 2. Mark booking as Confirmed
      if (booking_id) {
        await db.query("UPDATE roombook SET stat = 'Conform' WHERE id = $1", [booking_id]);
      }

      return res.status(201).json({
        success: true,
        message: 'Payment received successfully. Booking confirmed!',
        payment: result.rows[0]
      });
    } else {
      const newId = db.mockStore.payment.length > 0 
        ? Math.max(...db.mockStore.payment.map(p => p.id)) + 1 
        : 1;

      const newPayment = {
        id: newId,
        booking_id: booking_id || null,
        title, fname, lname,
        troom, tbed, nroom: roomsCount,
        cin, cout,
        ttot, fintot, mepr, meal, btot,
        noofdays: days,
        payment_method: payMethod,
        payment_status: 'Paid',
        created_at: new Date()
      };

      db.mockStore.payment.unshift(newPayment);

      // Mark mock booking as confirmed
      if (booking_id) {
        const found = db.mockStore.roombook.find(b => b.id === parseInt(booking_id, 10));
        if (found) found.stat = 'Conform';
      }

      return res.status(201).json({
        success: true,
        message: 'Payment received successfully. Booking confirmed!',
        payment: newPayment
      });
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed: ' + error.message });
  }
};

// 2. Get all payments and profit/revenue summary
exports.getAllPayments = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM payment ORDER BY id DESC');
      const totalRevenue = result.rows.reduce((sum, p) => sum + parseFloat(p.fintot || 0), 0);
      return res.json({
        success: true,
        payments: result.rows,
        summary: {
          totalRevenue,
          totalTransactions: result.rows.length
        }
      });
    } else {
      const payments = [...db.mockStore.payment];
      const totalRevenue = payments.reduce((sum, p) => sum + parseFloat(p.fintot || 0), 0);
      return res.json({
        success: true,
        payments,
        summary: {
          totalRevenue,
          totalTransactions: payments.length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ success: false, message: 'Server error fetching payments' });
  }
};

// 3. Get invoice breakdown by booking_id or payment_id
exports.getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM payment WHERE id = $1 OR booking_id = $1 LIMIT 1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Invoice / Payment not found' });
      }
      return res.json({ success: true, invoice: result.rows[0] });
    } else {
      const invoice = db.mockStore.payment.find(p => p.id === parseInt(id, 10) || p.booking_id === parseInt(id, 10));
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice / Payment not found' });
      }
      return res.json({ success: true, invoice });
    }
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, message: 'Server error fetching invoice' });
  }
};

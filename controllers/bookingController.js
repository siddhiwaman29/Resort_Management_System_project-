const db = require('../config/db');

// Helper to calculate days between two dates
function calculateDays(cin, cout) {
  const d1 = new Date(cin);
  const d2 = new Date(cout);
  const diffTime = Math.abs(d2 - d1);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

// 1. Create a new reservation
exports.createBooking = async (req, res) => {
  try {
    const {
      title, fname, lname, email, national, country, phone,
      troom, bed, nroom, meal, cin, cout
    } = req.body;

    if (!title || !fname || !lname || !email || !cin || !cout || !troom || !bed) {
      return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
    }

    const nodays = calculateDays(cin, cout);
    const roomsCount = parseInt(nroom, 10) || 1;
    const stat = 'Not Conform';

    if (db.getIsConnected()) {
      // Check if user has active duplicate booking
      const checkResult = await db.query('SELECT COUNT(*) FROM roombook WHERE email = $1 AND stat != $2', [email, 'Cancelled']);
      if (checkResult && parseInt(checkResult.rows[0].count, 10) > 3) {
        return res.status(400).json({ success: false, message: 'Maximum booking requests reached for this email.' });
      }

      const insertQuery = `
        INSERT INTO roombook 
        (title, fname, lname, email, national, country, phone, troom, bed, nroom, meal, cin, cout, stat, nodays)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;
      const values = [
        title, fname, lname, email, national || 'Indian', country || 'India',
        phone, troom, bed, roomsCount, meal || 'Room only', cin, cout, stat, nodays
      ];

      const result = await db.query(insertQuery, values);
      return res.status(201).json({
        success: true,
        message: 'Your Booking application has been sent successfully!',
        booking: result.rows[0]
      });
    } else {
      // Mock store fallback
      const newId = db.mockStore.roombook.length > 0 
        ? Math.max(...db.mockStore.roombook.map(b => b.id)) + 1 
        : 1;

      const newBooking = {
        id: newId,
        title, fname, lname, email,
        national: national || 'Indian',
        country: country || 'India',
        phone, troom, bed,
        nroom: roomsCount,
        meal: meal || 'Room only',
        cin, cout, stat, nodays,
        created_at: new Date()
      };

      db.mockStore.roombook.unshift(newBooking);

      return res.status(201).json({
        success: true,
        message: 'Your Booking application has been sent successfully!',
        booking: newBooking
      });
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: 'Error processing reservation: ' + error.message });
  }
};

// 2. Get all bookings (with optional filter for status)
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;

    if (db.getIsConnected()) {
      let queryText = 'SELECT * FROM roombook ORDER BY id DESC';
      let params = [];
      if (status) {
        queryText = 'SELECT * FROM roombook WHERE stat = $1 ORDER BY id DESC';
        params = [status];
      }
      const result = await db.query(queryText, params);
      return res.json({ success: true, bookings: result.rows });
    } else {
      let bookings = [...db.mockStore.roombook];
      if (status) {
        bookings = bookings.filter(b => b.stat.toLowerCase() === status.toLowerCase());
      }
      return res.json({ success: true, bookings });
    }
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ success: false, message: 'Server error fetching bookings' });
  }
};

// 3. Confirm a booking (Status -> 'Conform')
exports.confirmBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      const result = await db.query(
        "UPDATE roombook SET stat = 'Conform' WHERE id = $1 RETURNING *",
        [id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      return res.json({ success: true, message: 'Booking confirmed successfully', booking: result.rows[0] });
    } else {
      const booking = db.mockStore.roombook.find(b => b.id === parseInt(id, 10));
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      booking.stat = 'Conform';
      return res.json({ success: true, message: 'Booking confirmed successfully', booking });
    }
  } catch (error) {
    console.error('Error confirming booking:', error);
    res.status(500).json({ success: false, message: 'Server error confirming booking' });
  }
};

// 4. Cancel / Reject booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      const result = await db.query(
        "UPDATE roombook SET stat = 'Cancelled' WHERE id = $1 RETURNING *",
        [id]
      );
      return res.json({ success: true, message: 'Booking cancelled successfully', booking: result.rows[0] });
    } else {
      const booking = db.mockStore.roombook.find(b => b.id === parseInt(id, 10));
      if (!booking) {
        return res.status(404).json({ success: false, message: 'Booking not found' });
      }
      booking.stat = 'Cancelled';
      return res.json({ success: true, message: 'Booking cancelled successfully', booking });
    }
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: 'Server error cancelling booking' });
  }
};

// 5. Delete booking
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      await db.query('DELETE FROM roombook WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Booking deleted successfully' });
    } else {
      db.mockStore.roombook = db.mockStore.roombook.filter(b => b.id !== parseInt(id, 10));
      return res.json({ success: true, message: 'Booking deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ success: false, message: 'Server error deleting booking' });
  }
};

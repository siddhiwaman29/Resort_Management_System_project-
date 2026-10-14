const db = require('../config/db');

// 1. Submit guest feedback
exports.submitFeedback = async (req, res) => {
  try {
    const { fullname, email, rating, comment } = req.body;

    if (!fullname || !email || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'All feedback fields are required.' });
    }

    const numRating = parseInt(rating, 10);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
    }

    if (db.getIsConnected()) {
      const queryText = `
        INSERT INTO feedback (fullname, email, rating, comment)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const result = await db.query(queryText, [fullname, email, numRating, comment]);
      return res.status(201).json({ success: true, message: 'Thank you for your valuable feedback!', feedback: result.rows[0] });
    } else {
      const newId = db.mockStore.feedback.length > 0 
        ? Math.max(...db.mockStore.feedback.map(f => f.id)) + 1 
        : 1;

      const newFeedback = {
        id: newId,
        fullname,
        email,
        rating: numRating,
        comment,
        created_at: new Date()
      };

      db.mockStore.feedback.unshift(newFeedback);
      return res.status(201).json({ success: true, message: 'Thank you for your valuable feedback!', feedback: newFeedback });
    }
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Server error submitting feedback' });
  }
};

// 2. Get all feedback
exports.getAllFeedback = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM feedback ORDER BY id DESC');
      return res.json({ success: true, feedbacks: result.rows });
    } else {
      return res.json({ success: true, feedbacks: db.mockStore.feedback });
    }
  } catch (error) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ success: false, message: 'Server error fetching feedback' });
  }
};

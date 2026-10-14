const db = require('../config/db');

// 1. Submit contact message / inquiry
exports.submitContact = async (req, res) => {
  try {
    const { fullname, phone_no, email, message } = req.body;

    if (!fullname || !email || !phone_no) {
      return res.status(400).json({ success: false, message: 'Please provide full name, email, and phone number.' });
    }

    if (db.getIsConnected()) {
      const queryText = `
        INSERT INTO contact (fullname, phone_no, email, cdate, approval, message)
        VALUES ($1, $2, $3, CURRENT_DATE, 'Not Allowed', $4)
        RETURNING *
      `;
      const result = await db.query(queryText, [fullname, phone_no, email, message || '']);
      return res.status(201).json({ success: true, message: 'Message sent successfully. Our team will contact you!', contact: result.rows[0] });
    } else {
      const newId = db.mockStore.contact.length > 0 
        ? Math.max(...db.mockStore.contact.map(c => c.id)) + 1 
        : 1;

      const newContact = {
        id: newId,
        fullname,
        phone_no,
        email,
        cdate: new Date().toISOString().split('T')[0],
        approval: 'Not Allowed',
        message: message || ''
      };

      db.mockStore.contact.unshift(newContact);
      return res.status(201).json({ success: true, message: 'Message sent successfully. Our team will contact you!', contact: newContact });
    }
  } catch (error) {
    console.error('Error submitting contact:', error);
    res.status(500).json({ success: false, message: 'Server error submitting contact' });
  }
};

// 2. Get all contact inquiries (admin)
exports.getAllContacts = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM contact ORDER BY id DESC');
      return res.json({ success: true, contacts: result.rows });
    } else {
      return res.json({ success: true, contacts: db.mockStore.contact });
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, message: 'Server error fetching contacts' });
  }
};

// 3. Approve contact inquiry
exports.approveContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      const result = await db.query("UPDATE contact SET approval = 'Allowed' WHERE id = $1 RETURNING *", [id]);
      return res.json({ success: true, message: 'Inquiry marked as Allowed', contact: result.rows[0] });
    } else {
      const contact = db.mockStore.contact.find(c => c.id === parseInt(id, 10));
      if (!contact) {
        return res.status(404).json({ success: false, message: 'Contact not found' });
      }
      contact.approval = 'Allowed';
      return res.json({ success: true, message: 'Inquiry marked as Allowed', contact });
    }
  } catch (error) {
    console.error('Error approving contact:', error);
    res.status(500).json({ success: false, message: 'Server error approving contact' });
  }
};

// 4. Subscribe to newsletter
exports.subscribeNewsletter = async (req, res) => {
  try {
    const { email, title, subject } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    if (db.getIsConnected()) {
      const queryText = `
        INSERT INTO newsletter (email, title, subject)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE SET title = EXCLUDED.title, subject = EXCLUDED.subject
        RETURNING *
      `;
      const result = await db.query(queryText, [email, title || 'Subscriber', subject || 'Resort Updates']);
      return res.status(201).json({ success: true, message: 'Subscribed to resort newsletter successfully!', newsletter: result.rows[0] });
    } else {
      const existing = db.mockStore.newsletter.find(n => n.email === email);
      if (!existing) {
        const newSub = {
          id: db.mockStore.newsletter.length + 1,
          title: title || 'Subscriber',
          subject: subject || 'Resort Updates',
          email,
          created_at: new Date()
        };
        db.mockStore.newsletter.unshift(newSub);
      }
      return res.status(201).json({ success: true, message: 'Subscribed to resort newsletter successfully!' });
    }
  } catch (error) {
    console.error('Error subscribing newsletter:', error);
    res.status(500).json({ success: false, message: 'Server error subscribing to newsletter' });
  }
};

// 5. Get newsletter subscribers (admin)
exports.getAllNewsletters = async (req, res) => {
  try {
    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM newsletter ORDER BY id DESC');
      return res.json({ success: true, newsletters: result.rows });
    } else {
      return res.json({ success: true, newsletters: db.mockStore.newsletter });
    }
  } catch (error) {
    console.error('Error fetching newsletters:', error);
    res.status(500).json({ success: false, message: 'Server error fetching newsletters' });
  }
};

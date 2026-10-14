const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    let user = null;

    if (db.getIsConnected()) {
      const result = await db.query('SELECT * FROM login WHERE usname = $1 AND pass = $2', [username, password]);
      if (result && result.rows.length > 0) {
        user = result.rows[0];
      }
    } else {
      user = db.mockStore.login.find(u => u.usname === username && u.pass === password);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Your Login Name or Password is invalid' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.usname, role: user.role || 'admin' },
      process.env.JWT_SECRET || 'resort_management_secret_key_2024',
      { expiresIn: '24h' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.usname,
        role: user.role || 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, role = 'user' } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both username and password' });
    }

    if (db.getIsConnected()) {
      const exists = await db.query('SELECT id FROM login WHERE usname = $1', [username]);
      if (exists && exists.rows.length > 0) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }

      const result = await db.query(
        'INSERT INTO login (usname, pass, role) VALUES ($1, $2, $3) RETURNING id, usname, role',
        [username, password, role]
      );
      const newUser = result.rows[0];

      const token = jwt.sign(
        { id: newUser.id, username: newUser.usname, role: newUser.role },
        process.env.JWT_SECRET || 'resort_management_secret_key_2024',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: newUser.id,
          username: newUser.usname,
          role: newUser.role
        }
      });
    } else {
      const exists = db.mockStore.login.find(u => u.usname.toLowerCase() === username.toLowerCase());
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }

      const newUser = {
        id: db.mockStore.login.length + 1,
        usname: username,
        pass: password,
        role: role || 'user'
      };
      db.mockStore.login.push(newUser);

      const token = jwt.sign(
        { id: newUser.id, username: newUser.usname, role: newUser.role },
        process.env.JWT_SECRET || 'resort_management_secret_key_2024',
        { expiresIn: '24h' }
      );

      return res.json({
        success: true,
        message: 'Account registered successfully',
        token,
        user: {
          id: newUser.id,
          username: newUser.usname,
          role: newUser.role
        }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  res.json({ success: true, user: req.user });
};


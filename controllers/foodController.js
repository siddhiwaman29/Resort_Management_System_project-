const db = require('../config/db');

// 1. Get all food items
exports.getAllFood = async (req, res) => {
  try {
    const { category } = req.query;

    if (db.getIsConnected()) {
      let queryText = 'SELECT * FROM food_menu WHERE is_available = true';
      let params = [];
      if (category) {
        queryText += ' AND category = $1';
        params.push(category);
      }
      queryText += ' ORDER BY id ASC';

      const result = await db.query(queryText, params);
      return res.json({ success: true, foods: result.rows });
    } else {
      let foods = [...db.mockStore.food_menu];
      if (category) {
        foods = foods.filter(f => f.category.toLowerCase() === category.toLowerCase());
      }
      return res.json({ success: true, foods });
    }
  } catch (error) {
    console.error('Error fetching food menu:', error);
    res.status(500).json({ success: false, message: 'Server error fetching food menu' });
  }
};

// 2. Add food item
exports.addFood = async (req, res) => {
  try {
    const { name, category, price, description, image_url } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({ success: false, message: 'Name, category, and price are required.' });
    }

    if (db.getIsConnected()) {
      const queryText = `
        INSERT INTO food_menu (name, category, price, description, image_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const result = await db.query(queryText, [name, category, parseFloat(price), description || '', image_url || '']);
      return res.status(201).json({ success: true, message: 'Dish added to menu', food: result.rows[0] });
    } else {
      const newId = db.mockStore.food_menu.length > 0 
        ? Math.max(...db.mockStore.food_menu.map(f => f.id)) + 1 
        : 1;

      const newDish = {
        id: newId,
        name,
        category,
        price: parseFloat(price),
        description: description || '',
        image_url: image_url || '',
        is_available: true
      };

      db.mockStore.food_menu.push(newDish);
      return res.status(201).json({ success: true, message: 'Dish added to menu', food: newDish });
    }
  } catch (error) {
    console.error('Error adding dish:', error);
    res.status(500).json({ success: false, message: 'Server error adding dish' });
  }
};

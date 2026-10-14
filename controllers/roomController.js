const db = require('../config/db');

// 1. Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const { type, status } = req.query;

    if (db.getIsConnected()) {
      let queryText = 'SELECT * FROM room WHERE 1=1';
      let params = [];
      let index = 1;

      if (type) {
        queryText += ` AND type = $${index++}`;
        params.push(type);
      }
      if (status) {
        queryText += ` AND status = $${index++}`;
        params.push(status);
      }
      queryText += ' ORDER BY id ASC';

      const result = await db.query(queryText, params);
      return res.json({ success: true, rooms: result.rows });
    } else {
      let rooms = [...db.mockStore.room];
      if (type) {
        rooms = rooms.filter(r => r.type.toLowerCase() === type.toLowerCase());
      }
      if (status) {
        rooms = rooms.filter(r => r.status.toLowerCase() === status.toLowerCase());
      }
      return res.json({ success: true, rooms });
    }
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ success: false, message: 'Server error fetching rooms' });
  }
};

// 2. Add a new room (Manager posts available rooms)
exports.addRoom = async (req, res) => {
  try {
    const { type, bedding, place, price, status, image_url, description } = req.body;

    if (!type || !bedding || !place) {
      return res.status(400).json({ success: false, message: 'Room type, bedding, and room number/place are required.' });
    }

    const roomPrice = parseFloat(price) || 2500.00;
    const roomStatus = status || 'Available';
    const roomImage = image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';

    if (db.getIsConnected()) {
      const queryText = `
        INSERT INTO room (type, bedding, place, price, status, image_url, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      const values = [type, bedding, place, roomPrice, roomStatus, roomImage, description || ''];
      const result = await db.query(queryText, values);
      return res.status(201).json({ success: true, message: 'Room added successfully', room: result.rows[0] });
    } else {
      const newId = db.mockStore.room.length > 0 
        ? Math.max(...db.mockStore.room.map(r => r.id)) + 1 
        : 1;

      const newRoom = {
        id: newId,
        type,
        bedding,
        place,
        cusid: null,
        price: roomPrice,
        status: roomStatus,
        image_url: roomImage,
        description: description || ''
      };

      db.mockStore.room.push(newRoom);
      return res.status(201).json({ success: true, message: 'Room added successfully', room: newRoom });
    }
  } catch (error) {
    console.error('Error adding room:', error);
    res.status(500).json({ success: false, message: 'Server error adding room' });
  }
};

// 3. Update room
exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, bedding, place, price, status, image_url, description } = req.body;

    if (db.getIsConnected()) {
      const queryText = `
        UPDATE room 
        SET type = COALESCE($1, type),
            bedding = COALESCE($2, bedding),
            place = COALESCE($3, place),
            price = COALESCE($4, price),
            status = COALESCE($5, status),
            image_url = COALESCE($6, image_url),
            description = COALESCE($7, description)
        WHERE id = $8
        RETURNING *
      `;
      const values = [type, bedding, place, price, status, image_url, description, id];
      const result = await db.query(queryText, values);
      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }
      return res.json({ success: true, message: 'Room updated successfully', room: result.rows[0] });
    } else {
      const roomIndex = db.mockStore.room.findIndex(r => r.id === parseInt(id, 10));
      if (roomIndex === -1) {
        return res.status(404).json({ success: false, message: 'Room not found' });
      }

      db.mockStore.room[roomIndex] = {
        ...db.mockStore.room[roomIndex],
        ...(type && { type }),
        ...(bedding && { bedding }),
        ...(place && { place }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(status && { status }),
        ...(image_url && { image_url }),
        ...(description !== undefined && { description })
      };

      return res.json({ success: true, message: 'Room updated successfully', room: db.mockStore.room[roomIndex] });
    }
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ success: false, message: 'Server error updating room' });
  }
};

// 4. Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    if (db.getIsConnected()) {
      await db.query('DELETE FROM room WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Room removed successfully' });
    } else {
      db.mockStore.room = db.mockStore.room.filter(r => r.id !== parseInt(id, 10));
      return res.json({ success: true, message: 'Room removed successfully' });
    }
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Server error deleting room' });
  }
};

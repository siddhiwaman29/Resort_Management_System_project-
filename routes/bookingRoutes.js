const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

// Guest & Admin routes
router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.put('/:id/confirm', bookingController.confirmBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.delete('/:id', bookingController.deleteBooking);

module.exports = router;

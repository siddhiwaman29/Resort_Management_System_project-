const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/', paymentController.processPayment);
router.get('/', paymentController.getAllPayments);
router.get('/invoice/:id', paymentController.getInvoice);

module.exports = router;

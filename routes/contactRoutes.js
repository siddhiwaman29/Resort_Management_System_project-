const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.submitContact);
router.get('/', contactController.getAllContacts);
router.put('/:id/approve', contactController.approveContact);

// Newsletter routes
router.post('/newsletter', contactController.subscribeNewsletter);
router.get('/newsletter', contactController.getAllNewsletters);

module.exports = router;

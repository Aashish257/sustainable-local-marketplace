const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { mockPayment } = require('../controllers/paymentController');

const router = express.Router();

router.post('/mock', authMiddleware, mockPayment);

module.exports = router;

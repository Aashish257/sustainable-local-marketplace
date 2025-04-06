const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  placeOrder,
  getMyOrders,
  getFarmerOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

const router = express.Router();

router.post('/', protect, placeOrder);
router.get('/my', protect, getMyOrders);
router.get('/farmer', protect, getFarmerOrders);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;

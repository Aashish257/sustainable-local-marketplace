const Order = require('../models/Order');

exports.mockPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order already paid' });
    }

    order.paymentStatus = 'paid';
    order.status = 'shipped'; // Optional: auto-update order status
    await order.save();

    res.json({ message: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

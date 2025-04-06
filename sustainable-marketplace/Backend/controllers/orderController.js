const Order = require('../models/Order');
const Product = require('../models/Product');

exports.placeOrder = async (req, res) => {
  try {
    const { products } = req.body;
    const buyerId = req.user._id;

    let totalAmount = 0;

    // Validate and calculate total
    const orderItems = await Promise.all(products.map(async item => {
      const product = await Product.findById(item.product);
      totalAmount += product.price * item.quantity;
      return {
        product: product._id,
        quantity: item.quantity,
      };
    }));

    const newOrder = await Order.create({
      buyer: buyerId,
      products: orderItems,
      totalAmount,
    });

    res.status(201).json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.user._id;

    // Get all products posted by this farmer
    const farmerProducts = await Product.find({ postedBy: farmerId }).select('_id');

    const orders = await Order.find({
      'products.product': { $in: farmerProducts.map(p => p._id) }
    })
      .populate('buyer', 'name email')
      .populate('products.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status || order.status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Review = require('../models/Review');

exports.addReview = async (req, res) => {
  const { product, rating, comment } = req.body;

  try {
    const newReview = await Review.create({
      product,
      user: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

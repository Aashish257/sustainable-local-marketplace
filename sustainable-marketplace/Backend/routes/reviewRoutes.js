const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { addReview, getProductReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, addReview);
router.get('/product/:id', getProductReviews);

module.exports = router;

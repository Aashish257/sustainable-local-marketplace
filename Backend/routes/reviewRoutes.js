const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { addReview, getProductReviews } = require('../controllers/reviewController');

const router = express.Router();

router.post('/', authMiddleware, addReview);
router.get('/product/:id', getProductReviews);

module.exports = router;

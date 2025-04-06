const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createProduct, getProducts, getProductById, updateProduct, deleteProduct } = require('../controllers/productController_new');
const authMiddleware = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected Routes
router.post('/', authMiddleware, upload.array('images', 5), createProduct);
router.put('/:id', authMiddleware, updateProduct);
router.delete('/:id', authMiddleware, deleteProduct);

module.exports = router;

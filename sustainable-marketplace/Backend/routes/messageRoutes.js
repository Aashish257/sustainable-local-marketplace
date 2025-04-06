const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { sendMessage, getConversation } = require('../controllers/messageController');

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/conversation/:userId', protect, getConversation);

module.exports = router;

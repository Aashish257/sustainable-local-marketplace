const express = require('express');
const router = express.Router();

// Example user route
router.get('/', (req, res) => {
  res.json({message: 'Users route working'});
});

module.exports = router;

const express = require('express');
const router = express.Router();

router.use('/categories', require('./category'));
router.use('/products', require('./product'));

module.exports = router;

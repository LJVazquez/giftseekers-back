const express = require('express');
const router = express.Router();
const { index, show, store } = require('../controllers/User');

router.get('/', index);
router.get('/:id', show);
router.post('/', store);

module.exports = router;

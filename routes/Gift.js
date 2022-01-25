const express = require('express');
const router = express.Router();
const {
	index,
	show,
	store,
	update,
	seek,
	unseek,
	latest,
	hottest,
} = require('../controllers/Gift');
const { decodeToken } = require('../controllers/Login');

router.get('/', index);
router.get('/:id', show);
router.get('/latest/:amount', latest);
router.get('/hottest/:amount', hottest);
router.post('/', decodeToken, store);
router.patch('/:id', decodeToken, update);
router.patch('/:id/seek', decodeToken, seek);
router.patch('/:id/unseek', decodeToken, unseek);

module.exports = router;

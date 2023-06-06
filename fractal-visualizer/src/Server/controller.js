const express = require('express');
const router = express.Router();

const getRequest = require('./getRequest');
const postView = require('./postView');
const postRequest = require('./postRequest');
const invalidRequest = require('./invalidRequest');

router.get('/data', getRequest);
router.post('/data', postRequest);
router.post('/view', postView);

module.exports = router;

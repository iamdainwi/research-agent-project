const express = require('express');
const { proxyResearch, proxyDownload } = require('../controllers/research');
const { protect } = require('../middleware/auth');
const checkQuota = require('../middleware/quota');

const router = express.Router();

router.post('/', protect, checkQuota('research'), proxyResearch);
router.get('/download', protect, checkQuota('download'), proxyDownload);

module.exports = router;

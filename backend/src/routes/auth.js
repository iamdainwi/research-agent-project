const express = require('express');
const { register, login, getMe, generateApiKey, getApiKeys, deleteApiKey } = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/apikey', protect, generateApiKey);
router.get('/apikeys', protect, getApiKeys);
router.delete('/apikey/:id', protect, deleteApiKey);

module.exports = router;

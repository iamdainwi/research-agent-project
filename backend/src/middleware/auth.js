const jwt = require('jsonwebtoken');
const User = require('../models/User');
const APIKey = require('../models/APIKey');

exports.protect = async (req, res, next) => {
    let token;

    // Check for API Key first (x-api-key)
    if (req.headers['x-api-key']) {
        try {
            const keyStr = req.headers['x-api-key'];
            // Find key
            const apiKeyDoc = await APIKey.findOne({ key: keyStr }).populate('user');

            if (!apiKeyDoc) {
                return res.status(401).json({ success: false, error: 'Invalid API Key' });
            }

            req.user = apiKeyDoc.user;
            return next();
        } catch (err) {
            console.error(err);
            return res.status(401).json({ success: false, error: 'Not authorized (API Key Error)' });
        }
    }

    // Check for Bearer Token
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
    }
};

const User = require('../models/User');

const checkQuota = (type) => async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        const now = new Date();
        const lastReset = new Date(user.quota.lastReset);

        // Reset quota if it's a new day
        if (now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {

            user.quota.research.count = 0;
            user.quota.download.count = 0;
            user.quota.lastReset = now;
            await user.save();
        }

        // Check if quota exceeded
        if (user.quota[type].count >= user.quota[type].limit) {
            return res.status(429).json({
                success: false,
                error: `Daily ${type} quota exceeded. Limit is ${user.quota[type].limit}.`
            });
        }

        // Attach user to request for controller to increment after success or do it here?
        // Doing it here is safer for rate limiting, but controller might fail.
        // Let's attach the user object and let the controller increment/save OR
        // increment here. The prompt says "track... store current usage counts".
        // I will increment here for simplicity, or provide a helper to increment.

        // Actually, good practice is to check here, but increment only if operation starts.
        // I'll attach the user object (refreshed) to req.user
        req.user = user;
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Server Error verifying quota' });
    }
};

module.exports = checkQuota;

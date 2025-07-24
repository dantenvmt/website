const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Get the token from the request header
    const token = req.header('x-auth-token');

    // 2. If no token is found, deny access
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // 3. If a token is found, verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add the user payload from the token to the request object
        req.user = decoded.user;
        // Call the next function in the chain (the actual route handler)
        next();
    } catch (err) {
        // If the token is invalid (e.g., expired or tampered with), deny access
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'password';

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(400).send({ error: 'Authentication required' });
        }

        const token = authHeader.substring(7);
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(400).send({ error: 'Invalid token' });
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (err) {
        res.status(400).send({ error: 'Invalid token' });
    }
};

module.exports = authenticate;

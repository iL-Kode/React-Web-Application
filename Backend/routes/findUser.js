const express = require('express');
const router = express.Router();
const User = require('../models/user');
const authenticate = require('../middleware/authentication');

router.get('/search', authenticate, async (req, res) => {
    try {
        const { q } = req.query;
        if (!q || q.trim().length === 0) {
            return res.status(400).send({ error: 'empty seach' });
        }
        
        const searchRegex = new RegExp(q.trim()
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

        const users = await User.find({
            username: searchRegex,
            _id: { $ne: req.user._id } 
        })
        .select('username _id');

        res.status(200).send(users);
    } catch (err) {
        res.status(500).send({ error: 'Something went wrong' });
    }
} );

router.get('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username');
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }
        res.status(200).send(user);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid user ID format' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});    

module.exports = router;

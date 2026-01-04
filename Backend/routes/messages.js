const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const Friend = require('../models/friend');
const { post } = require('../app');
const authenticate = require('../middleware/authentication');

async function checkIfFriends(userId1, userId2) {
    const friends = await Friend.findOne({
        $or: [
            { requester: userId1, recipient: userId2, status: 'accepted' },
            { requester: userId2, recipient: userId1, status: 'accepted' }
        ]
    });
    return !!friends;
}

router.post('/', authenticate, async (req, res) => {

    try {
        let { text, pageOwnerId } = req.body;
       
        text = text ? text.trim() : '';

        const newMessage = new Message({ text });
    
        if (!text || text.length < 1 || text.length > 140) {
            return res.status(400).send({ error: 'mesage must be between 1 and 140 characters' });
        }
    
        if (!pageOwnerId) {
            return res.status(400).send({ error: 'pageOwnerId is required' });
        }

        const ownPage = pageOwnerId === req.user._id.toString();
        const friends = await checkIfFriends(req.user._id, pageOwnerId);

        if (!ownPage && !friends) {
            return res.status(403).send({ error: 'Cant Post' });
        }

        const message = new Message({
            author: req.user._id,
            pageOwner: pageOwnerId,
            text
        });
        
        await message.save();
        await message.populate('author', 'username');
    
        res.status(200).send(post);

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ error: 'wrong parameter' });
        }
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid pageOwnerId format' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }

});

router.get('/page/:userId', authenticate, async (req, res, next) => {
    try {
        const pageOwnerId = req.params.userId;

        const ownPage = pageOwnerId === req.user._id.toString();
        const friends = await checkIfFriends(req.user._id, pageOwnerId);

        if (!ownPage && !friends) {
            return res.status(403).send({ error: 'Cant view' });
        }

        const messages = await Message.find({ pageOwner: pageOwnerId })
            .sort({ createdAt: -1 })
            .populate('author', 'username');

        res.status(200).send(messages);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid userId format' });
        }
        next(err);
    }
    
});

module.exports = router;
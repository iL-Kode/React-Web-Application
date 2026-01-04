const express = require('express');
const router = express.Router();
const Friend = require('../models/friend');
const authenticate = require('../middleware/authentication');
const User = require('../models/user');

router.post('/request', authenticate, async (req, res) => {
    try {
        const { recipientId } = req.body;
        
        if (!recipientId) {
            return res.status(400).send({ error: 'recipientId is required' });
        }
        if (recipientId === req.user._id.toString()) {
            return res.status(400).send({ error: 'loser' });
        }
        
        const existingReqOrFri = await Friend.findOne({
            $or: [
                { requester: req.user._id, recipient: recipientId },
                { requester: recipientId, recipient: req.user._id }
            ]
        });
        
        if (existingReqOrFri) {
            return res.status(400).send({ error: 'already friends or rejected' });
        }
        
        const friendRequest = new Friend({
            requester: req.user._id,
            recipient: recipientId
        });
        
        await friendRequest.save();
        res.status(200).send(friendRequest);
        
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ error: 'wrong parameter' });
        }
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid recipientId format' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});

router.get('/friends', authenticate, async (req, res) => {
    try {
        const friends = await Friend.find({
            $or: [
                { requester: req.user._id, status: 'accepted' },
                { recipient: req.user._id, status: 'accepted' }
            ]
        }).populate('requester', 'username').populate('recipient', 'username');
        
        res.status(200).send(friends);
    } catch (err) {
        res.status(500).send({ error: 'Something went wrong' });
    }
});

router.patch('/:requestId/reject', authenticate, async (req, res) => {
    try {
        const friendRequest = await Friend.findById(req.params.requestId);
        
        if (!friendRequest) {
            return res.status(404).send({ error: 'not found' });
        }
        
        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'unathorized' });
        }
        
        if (friendRequest.status !== 'pending') {
            return res.status(400).send({ error: 'not pending' });
        }
        
        friendRequest.status = 'rejected';
        await friendRequest.save();
        res.status(200).send(friendRequest);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid format' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});

router.patch('/:requestId/accept', authenticate, async (req, res) => {
    try {
        const friendRequest = await Friend.findById(req.params.requestId);
        
        if (!friendRequest) {
            return res.status(404).send({ error: 'not found' });
        }
        
        if (friendRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).send({ error: 'unathorized' });
        }
        
        if (friendRequest.status !== 'pending') {
            return res.status(400).send({ error: 'not pending' });
        }
        
        friendRequest.status = 'accepted';
        await friendRequest.save();
        res.status(200).send(friendRequest);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).send({ error: 'Invalid format' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});

router.get('/request/pending', authenticate, async (req, res) => {
    try {
        const pendingRequests = await Friend.find({
            recipient: req.user._id,
            status: 'pending'
        }).populate('requester', 'username');
        
        res.status(200).send(pendingRequests);
    } catch (err) {
        res.status(500).send({ error: 'Something went wrong' });
    }
});

module.exports = router;
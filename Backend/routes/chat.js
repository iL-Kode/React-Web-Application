const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Friend = require('../models/friend');
const ChatRoom = require('../models/chatRoom');
const ChatMessage = require('../models/chatMessage');
const auth = require('../middleware/authentication');

router.get('/room/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user.id;

    const areFriends = await Friend.findOne({
      $or: [
        { requester: me, recipient: userId, status: 'accepted' },
        { requester: userId, recipient: me, status: 'accepted' }
      ]
    });

    if (!areFriends) {
      return res.status(403).json({ error: 'Chat available only for friends' });
    }

    let chatRoom = await ChatRoom.findOne({
      participants: { $all: [me, userId] }
    }).populate('participants', 'username');

    if (!chatRoom) {
      chatRoom = new ChatRoom({
        participants: [me, userId]
      });
      await chatRoom.save();
      await chatRoom.populate('participants', 'username');
    }

    res.json(chatRoom);
  } catch (err) {
    console.error('Error getting chat room:', err);
    res.status(500).json({ error: 'Failed to get chat room' });
  }
});

router.get('/messages/:roomId', auth, async (req, res) => {
  try {
    const { roomId } = req.params;
    const me = req.user.id;

    const room = await ChatRoom.findById(roomId);
    if (!room || !room.participants.includes(me)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const allMessages = await ChatMessage.find({ roomId })
      .populate('sender', 'username')
      .sort({ createdAt: 1 });

    res.json(allMessages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

router.get('/rooms', auth, async (req, res) => {
  try {
    const me = req.user.id;

    const myRooms = await ChatRoom.find({ participants: me })
      .populate('participants', 'username')
      .sort({ updatedAt: -1 });

    res.json(myRooms);
  } catch (err) {
    console.error('Error getting chat rooms:', err);
    res.status(500).json({ error: 'Failed to get chat rooms' });
  }
});

module.exports = router;
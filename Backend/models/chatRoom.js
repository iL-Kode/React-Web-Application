const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, {
  timestamps: true
});

chatRoomSchema.pre('save', function(next) {
  if (this.participants.length !== 2) {
    return next(new Error('Error'));
  }
  next();
});

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
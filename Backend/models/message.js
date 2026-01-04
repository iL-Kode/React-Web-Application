const mongoose = require('mongoose');
const sanitizeHtml = require('sanitize-html');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pageOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 140,
        set: (v) => sanitizeHtml(v, {
            allowedTags: [],
            allowedAttributes: {}
        })
    },
    //read: {
    //    type: Boolean,
    //    default: false 
    //},
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

messageSchema.index({ pageOwner: 1, createdAt: -1 });

const Message = mongoose.model('message', messageSchema);

module.exports = Message;
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const ChatMessage = require('./models/chatMessage');

const dbURI = 'mongodb uri';

mongoose.connect(dbURI)
    .then((result) => {
        const server = http.createServer(app);
        const io = new Server(server, {
            cors: {
                origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://localhost:5501'],
                methods: ['GET', 'POST']
            }
        });

        io.on('connection', (socket) => {
            console.log('User connected:', socket.id);

            socket.on('join-room', (roomId) => {
                socket.join(roomId);
                console.log(`User ${socket.id} joined room ${roomId}`);
            });

            socket.on('leave-room', (roomId) => {
                socket.leave(roomId);
                console.log(`User ${socket.id} left room ${roomId}`);
            });

            socket.on('send-message', async (data) => {
                try {
                    const msg = new ChatMessage({
                        roomId: data.roomId,
                        sender: data.senderId,
                        message: data.message
                    });
                    await msg.save();

                    io.to(data.roomId).emit('receive-message', {
                        message: data.message,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        timestamp: msg.createdAt.toISOString()
                    });
                } catch (error) {
                    console.error('Error saving message:', error);
                    io.to(data.roomId).emit('receive-message', {
                        message: data.message,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        timestamp: new Date().toISOString()
                    });
                }
            });

            socket.on('typing', (data) => {
                socket.to(data.roomId).emit('user-typing', {
                    userId: data.userId,
                    userName: data.userName,
                    isTyping: data.isTyping
                });
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        server.listen(3000, () => {
            console.log('Server running on port 3000 with Socket.IO');
        });
    })
    .catch((err) => console.log(err));

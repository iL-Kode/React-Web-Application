const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

const authenticationRoutes = require('./routes/authentication');
const findUserRoutes = require('./routes/findUser');
const friendsRoutes = require('./routes/friends');
const messagesRoutes = require('./routes/messages');
const chatRoutes = require('./routes/chat');

app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:5501', 'http://localhost:5501'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use((req, res, next) => {
    console.log('\nNew Request Made:');
    console.log('host: ', req.hostname);
    console.log('path: ', req.path);
    console.log('method: ', req.method);
    next();
});

app.use('/auth', authenticationRoutes);
app.use('/users', findUserRoutes);
app.use('/friends', friendsRoutes);
app.use('/messages', messagesRoutes);
app.use('/chat', chatRoutes);

app.use((req, res) => {
    res.status(404).send({ error: 'page not found' });
});

app.use((err, req, res, next) => {
    console.log(err.stack);
    res.status(500).send({ error: 'Something went wrong' });
});

module.exports = app;
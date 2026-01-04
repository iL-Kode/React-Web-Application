const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'password';

router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: 'Username & Password required' });
        }
        
        if (username.trim().length < 3 || username.trim().length > 30) {
            return res.status(400).send({ error: 'Username must be between 3 and 15 characters' });
        }
        
        if (password.length < 6) {
            return res.status(400).send({ error: 'Password must be at least 6 characters long' });
        }
        
        const userExists = await User.findOne({ username: username.trim() });
        if (userExists) {
            return res.status(400).send({ error: 'Username already taken' });
        }
        
        const newUser = new User({ username: username.trim(), password });
        
        await newUser.save();
        
        const token = jwt.sign({ userId: newUser._id }, secret);
        
        res.status(200).send({ token });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ error: 'wrong parameter' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).send({ error: 'Username & password required' });
        }
        
        const foundUser = await User.findOne({ username: username.trim() });
        if (!foundUser) {
            return res.status(400).send({ error: 'Invalid username' });
        }
        
        const passwordOk = await foundUser.comparePassword(password);
        if (!passwordOk) {
            return res.status(400).send({ error: 'Invalid password' });
        }
        
        const token = jwt.sign({ userId: foundUser._id }, secret);
        
        res.status(200).send({ token });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).send({ error: 'wrong parameter' });
        }
        res.status(500).send({ error: 'Something went wrong' });
    }
});

module.exports = router;
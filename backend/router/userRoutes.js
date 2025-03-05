// backend/router/userRoutes.js Add serch

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const auth = require('../middleware/auth');
const User = require('../model/User');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const jwt_secret = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
    const token = req.headers['x-auth-token'];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, jwt_secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Route for updating the user's password
router.put('/update-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating password' });
    }
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage: storage });

router.put('/update-picture', auth, upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.user;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();
        res.json({ message: 'Profile picture updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search user
router.get('/search', async (req, res) => {
    try {
      const { username } = req.query;
  
      if (!username) {
        return res.status(400).json({ message: 'Username query parameter is required.' });
      }
  
      const users = await User.find({
        username: { $regex: username, $options: 'i' } // ดึงid user มา
      }).select('username profilePicture _id'); // ดึงรูปมาแสดง
  
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router;

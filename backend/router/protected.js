const express = require('express');
const auth = require('../middleware/auth');
const User = require('../model/User'); // Import your User model

const router = express.Router();

router.get('/protected', auth, async (req, res) => {
    try {
       // หาไอดี user
        const user = await User.findById(req.user);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        
        res.json({
            message: 'Protected route accessed',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profilePicture: user.profilePicture, 
            },
        });
    } catch (error) {
        console.error('Error fetching user:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

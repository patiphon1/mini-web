const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../model/Post');
const User = require('../model/User');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// multer setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// GET all posts
router.get('/', async (req, res) => {
    try {
        // Populate user and comments
        const posts = await Post.find()
            .populate('user', 'username profilePicture')
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username' // เลือกเฉพาะ username
                }
            })
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST a new post
router.post('/', auth, upload.single('file'), async (req, res) => {
    try {
        const { text } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : null;

        const post = new Post({
            text,
            user: req.user, // ดึงมาจาก auth middleware
            image,
        });
        await post.save();

        
        await post.populate('user', 'username profilePicture');

        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

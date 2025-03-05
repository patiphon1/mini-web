const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Comment = require('../model/Comment');
const Post = require('../model/Post');

// POST a comment
router.post('/:postId', auth, async (req, res) => {
    try {
        const { text } = req.body;
        const { postId } = req.params;

        // ตรวจสอบว่า post นี้มีอยู่จริง
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const comment = new Comment({
            text,
            user: req.user, // user id from auth middleware
            post: postId
        });

        await comment.save();

        // อัพเดต comment ใน post
        post.comments.push(comment._id);
        await post.save();
        await comment.populate('user', 'username');

        res.status(201).json(comment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

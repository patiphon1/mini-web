const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('../model/Post');

// POST like/unlike a post
router.post('/:postId', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const userId = req.user;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            // Like post
            post.likes.push(userId);
        } else {
            // Unlike post
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        res.json({ likes: post.likes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

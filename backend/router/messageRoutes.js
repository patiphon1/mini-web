// backend/router/messageRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../model/Message');
const Chat = require('../model/Chat');
const multer = require('multer');
const path = require('path');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // เพิ่มรูปเพิ่มตั้งชื่อ
  }
});

const upload = multer({ storage: storage });

// POST send a new message
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const userId = req.user;

    const messageData = {
      chat: chatId,
      sender: userId,
    };
    if (text) {
      messageData.text = text;
    }

    if (req.file) {
      const fileType = req.file.mimetype.split('/')[0];
      if (fileType === 'image') {
        messageData.imageUrl = `/uploads/${req.file.filename}`;
      } else if (fileType === 'video') {
        messageData.videoUrl = `/uploads/${req.file.filename}`;
      }
    }
    const message = new Message(messageData);
    await message.save();

    // Update chat
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push(message._id);
    chat.updatedAt = new Date();
    await chat.save();

    await message.populate('sender', 'username profilePicture');

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

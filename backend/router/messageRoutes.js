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
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { chatId, text } = req.body;
    const userId = req.user;

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; // Image URL
    }

    const newMessage = new Message({
      chat: chatId,
      sender: userId,
      text,
      imageUrl // เก็บร๔ป
    });

    await newMessage.save();

    // อัพเดทแชท
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    chat.messages.push(newMessage._id);
    chat.updatedAt = new Date(); // อัพเวลา
    await chat.save();

    await newMessage.populate('sender', 'username profilePicture');

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

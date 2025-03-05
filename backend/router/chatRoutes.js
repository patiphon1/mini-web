const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../model/Chat');
const Message = require('../model/Message');
const User = require('../model/User');

// GET all 
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user;
    const chats = await Chat.find({ users: { $in: [userId] } })
      .populate('users', 'username profilePicture')
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'username profilePicture' },
        options: { sort: { createdAt: -1 }, limit: 1 }
      })
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create a new chat
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user;

    
    const existingChat = await Chat.findOne({
      users: { $all: [userId, recipientId] },
    });

    if (existingChat) {
      return res.status(200).json(existingChat);
    }

    const newChat = new Chat({
      users: [userId, recipientId],
    });
    await newChat.save();
    
    await newChat.populate('users', 'username profilePicture');

    res.status(201).json(newChat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// เรียนค่ามาจาก db
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('users', 'username profilePicture')
      .populate({
        path: 'messages',
        populate: { path: 'sender', select: 'username profilePicture' }
      });
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    res.json(chat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a chat
router.delete('/:chatId', auth, async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user;

    // ค้นหาแชท
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // เช็คpart
    if (!chat.users.includes(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    
    await Message.deleteMany({ chat: chatId });

    // Delete chat 
    await Chat.findByIdAndDelete(chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

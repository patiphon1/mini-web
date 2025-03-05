const express = require('express');
const multer = require('multer');
const path = require('path');
const Post = require('../model/Post');
const auth = require('../middleware/auth');
const router = express.Router();

// กำหนด Storage multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads'); // ระบุที่เก็บไฟล์ที่อัปโหลด
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เป็น timestamp + นามสกุลไฟล์
  },
});

// อนุญาตให้มีการอัปโหลด
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|mp4|mov/; // อนุญาตให้เป็นไฟล์รูปภาพและวิดีโอ
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true); // อนุญาตให้ไฟล์นี้อัปโหลด
  } else {
    cb(new Error('Only images and videos are allowed'), false); // ไม่อนุญาต
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // จำกัดขนาดไฟล์ไม่เกิน 10MB
  fileFilter: fileFilter,
});

// 📌 API สร้างโพสต์
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user;

    // เช็คว่าไฟล์มีการอัปโหลดหรือไม่
    const file = req.file ? `/uploads/${req.file.filename}` : ''; // ถ้ามีไฟล์จะเก็บ path ของไฟล์

    const newPost = new Post({
      userId: userId,
      text,
      image: file, // เก็บไฟล์ใน Post
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

//  API ดึงโพสต์ทั้งหมด
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('userId', 'username');
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

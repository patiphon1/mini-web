const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const http = require('http'); // Import the 'http' module
const { Server } = require('socket.io'); // Import Socket.IO
require('dotenv').config();

const authRoutes = require('./router/auth');
const protectedRoutes = require('./router/protected');
const likeRoutes = require('./router/likes');
const commentRoutes = require('./router/comments');
const postRoutes = require('./router/post');
const userRoutes = require('./router/userRoutes'); // ✅ ใช้ชื่อ users
const chatRoutes = require('./router/chatRoutes');
const messageRoutes = require('./router/messageRoutes');

const app = express();
const server = http.createServer(app); // Create an HTTP server using Express

// Create Socket.IO server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your frontend URL
        methods: ["GET", "POST"]
    }
});

// ✅ ตรวจสอบว่าโฟลเดอร์ uploads มีหรือไม่ ถ้าไม่มีให้สร้าง
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อ MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', protectedRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes); // ✅ แก้จาก userRoutes → users
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ให้สามารถเข้าถึงไฟล์ที่อัปโหลดได้
app.use('/api/chats', chatRoutes);
app.use('/api/messages', messageRoutes);

// Socket.IO logic
io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join-room', (chatId) => {
        socket.join(chatId);
        console.log(`User joined room: ${chatId}`);
    });

    socket.on('send-message', (newMessage) => {
        io.to(newMessage.chat).emit('receive-message', newMessage);
        console.log(`User send message in room: ${newMessage.chat}`);
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Middleware จัดการ error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// เปิดเซิร์ฟเวอร์
const port = process.env.PORT || 5000;
server.listen(port, () => { // Use the HTTP server to listen
    console.log(`🚀 Server running on port ${port}`);
});

const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        // ตรวจสอบและดึงข้อมูลจาก Token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ตรวจสอบว่า userId มีอยู่ใน decoded หรือไม่
        if (!decoded.userId) {
            return res.status(401).json({ message: 'Token is missing userId' });
        }
        
        // ส่งข้อมูล userId ไปยัง Request object
        req.user = decoded.userId;
        next();
    } catch (err) {
        console.error(err);
        res.status(401).json({ message: 'Token is not valid' });
    }
}

module.exports = auth;

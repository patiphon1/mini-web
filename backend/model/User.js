const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String,
    required: true, 
    unique: true
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  profilePicture: { 
    type: String, 
    default: '/uploads/default-profile.png' // รูปเริ่มต้น
  }, 
  resetToken: { 
    type: String, 
    default: '' 
  },
  resetTokenExpiry: { 
    type: Date, 
    default: null, 
    index: { expires: '1h' } // ลบ token อัตโนมัติหลัง 1 ชั่วโมง
  },
  pin: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);

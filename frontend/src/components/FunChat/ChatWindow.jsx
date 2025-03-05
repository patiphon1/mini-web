import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import { io } from 'socket.io-client'; // นำเข้า Socket.IO client

function ChatWindow({ chat, setChat }) {
  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previousImage, setPreviousImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // สร้าง state สำหรับแสดงตัวอย่างรูปภาพ
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('user');
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const socket = useRef(null); // เก็บ instance ของ Socket.IO

  useEffect(() => {
    // เชื่อมต่อกับเซิร์ฟเวอร์ Socket.IO
    socket.current = io('http://localhost:5000'); // เปลี่ยน URL เป็นของ backend ของคุณ

    // เข้าร่วมห้องแชท
    socket.current.emit('join-room', chat._id);

    // ฟังเหตุการณ์รับข้อความใหม่
    socket.current.on('receive-message', (newMessage) => {
      setChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, newMessage],
      }));
    });

    // ตัดการเชื่อมต่อเมื่อ component ถูกถอดออก
    return () => {
      socket.current.disconnect();
    };
  }, [chat._id, setChat]);

  const sendMessage = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าข้อความว่างเปล่าหรือไม่มีรูปภาพ
    if (!messageText.trim() && !selectedImage && !previousImage) {
      console.log("ไม่สามารถส่งข้อความว่างได้");
      return;
    }

    let imageToSend = selectedImage || previousImage;
    try {
      const formData = new FormData();
      formData.append('chatId', chat._id);
      formData.append('text', messageText);
      if (imageToSend) {
        formData.append('image', imageToSend);
      }

      const res = await axios.post(
        'http://localhost:5000/api/messages',
        formData,
        {
          headers: {
            'x-auth-token': token,
            'Content-Type': 'multipart/form-data', // จำเป็นสำหรับการอัปโหลดไฟล์
          },
        }
      );
      setMessageText('');
      // ตั้งค่ารูปภาพก่อนหน้าเมื่อส่งสำเร็จ
      if (selectedImage) {
        setPreviousImage(selectedImage);
      }
      setSelectedImage(null);
      setImagePreview(null); // ล้างตัวอย่างรูปหลังจากส่ง
      // อัปเดตสถานะแชท
      setChat((prevChat) => ({
        ...prevChat,
        messages: [...prevChat.messages, res.data], // เพิ่มข้อความใหม่เข้าไปในแชท
      }));
      // ส่งข้อความผ่าน Socket.IO
      socket.current.emit('send-message', res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCloseChat = () => {
    setChat(null);
    navigate(`/chat/new`);
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
    setPreviousImage(null);

    // สร้างตัวอย่างรูปภาพ
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleResendPreviousImage = () => {
    // หากผู้ใช้ต้องการส่งรูปซ้ำโดยไม่มีข้อความ
    if (previousImage) {
      sendMessage(new Event('submit'));
    }
  };

  const handleClearPreview = () => {
    setSelectedImage(null);
    setImagePreview(null);
    fileInputRef.current.value = ""; // รีเซ็ตค่า input file
  };

  if (!chat) return <div>Loading...</div>;

  // กำหนดชื่อของหัวข้อแชท
  let chatHeaderText = '';
  // กรองชื่อผู้ใช้ที่ไม่ใช่ตัวเองออก
  const otherUsers = chat.users.filter((user) => user._id !== userId);
  if (otherUsers.length === 1) {
    chatHeaderText = otherUsers[0].username;
  } else if (otherUsers.length > 1) {
    chatHeaderText = otherUsers.map(user => user.username).join(', ');
  }

  return (
    <div className="chat-window">
      <div className='chat-header'>
        <h2>{chatHeaderText}</h2> {/* แสดงชื่อหัวข้อแชท */}
        <button onClick={handleCloseChat}>ปิดแชท</button>
      </div>
      <div className="messages">
        {chat.messages.map((msg) => {
          const isCurrentUser = msg.sender._id === userId;
          const messageClass = isCurrentUser ? 'received' : 'sent';
          const defaultProfileUrl = 'http://localhost:5000/uploads/default-profile.png';

          return (
            <div key={msg._id} className={`message ${messageClass}`}>
              {!isCurrentUser && (
                <div className="message-header">
                  <img
                    src={msg.sender.profilePicture ? `http://localhost:5000${msg.sender.profilePicture}` : defaultProfileUrl}
                    alt="User Profile"
                    className="profile-picture-message"
                    onError={(e) => {
                      e.target.onerror = null; // ป้องกันการโหลดซ้ำไม่สิ้นสุด
                      e.target.src = defaultProfileUrl;
                    }}
                  />
                  <span className="message-sender">{msg.sender.username}</span>
                </div>
              )}
              <div className="message-content">
                {msg.text && <p>{msg.text}</p>}
                {msg.imageUrl && <img src={`http://localhost:5000${msg.imageUrl}`} alt="Uploaded" className="uploaded-image" />}
              </div>
              <div className='message-time'>
                {moment(msg.createdAt).format('HH:mm')}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={sendMessage}>
        {/* พื้นที่แสดงตัวอย่างรูปภาพ */}
        {imagePreview && (
          <div className="image-preview-container">
            <img src={imagePreview} alt="Preview" className="image-preview" />
            <button type="button" onClick={handleClearPreview}>ล้าง</button>
          </div>
        )}
        <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} />
        <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} style={{ display: "none" }} />
        <button type="button" onClick={handleImageClick} className="image-upload-button">
          <FaImage />
        </button>
        <button type='button' onClick={handleResendPreviousImage} disabled={!previousImage}></button>
        <button type="submit">ส่ง</button>
      </form>
    </div>
  );
}

export default ChatWindow;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { FaImage } from 'react-icons/fa';
import { io } from 'socket.io-client'; // นำเข้า Socket.IO client

function ChatWindow({ chat, setChat }) {
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null); //เปลี่ยนชื่อ
  const [previousFile, setPreviousFile] = useState(null); //เปลี่ยนชื่อ
  const [filePreview, setFilePreview] = useState(null); //เปลี่ยนชื่อ
  const [canSendMessage, setCanSendMessage] = useState(false); // New state
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

  useEffect(() => {
    // ตรวจสอบว่าสามารถส่งข้อความได้หรือไม่
    setCanSendMessage(messageText.trim().length > 0);
  }, [messageText]);

  const sendMessage = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่าสามารถส่งข้อความได้หรือไม่
    if (!canSendMessage && !selectedFile && !previousFile) {
      console.log("ไม่สามารถส่งข้อความว่างได้");
      return;
    }

     let fileToSend = selectedFile || previousFile; //เปลี่ยนชื่อ
    try {
      const formData = new FormData();
      formData.append('chatId', chat._id);
      if (messageText.trim()) {
        formData.append('text', messageText);
      }
      if (fileToSend) {
        formData.append('file', fileToSend);
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
       if (selectedFile) {
        setPreviousFile(selectedFile);
       }
      setSelectedFile(null);
      setFilePreview(null); // ล้างตัวอย่างรูปหลังจากส่ง
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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setPreviousFile(null);
     setMessageText('');// Clear messageText when a new image is selected
    // สร้างตัวอย่างรูปภาพ
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

    const handleTextChange = (event) => {
    setMessageText(event.target.value);
    setPreviousFile(null); // Clear previousImage when text is entered
    setSelectedFile(null)
    setFilePreview(null)
    };

  const handleResendPreviousFile = () => { //เปลี่ยนชื่อ
    // หากผู้ใช้ต้องการส่งรูปซ้ำโดยไม่มีข้อความ
    if (previousFile) { //เปลี่ยนชื่อ
      sendMessage(new Event('submit'));
    }
  };

  const handleClearPreview = () => { //เปลี่ยนชื่อ
    setSelectedFile(null); //เปลี่ยนชื่อ
    setFilePreview(null); //เปลี่ยนชื่อ
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
                 {msg.videoUrl && (
                  <video controls className="uploaded-video">
                    <source src={`http://localhost:5000${msg.videoUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
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
        {filePreview && (
          <div className="image-preview-container">
              {selectedFile.type.startsWith('image/') ? (
              <img src={filePreview} alt="Preview" className="image-preview" />
            ) : (
              <video src={filePreview} alt="Preview" className="image-preview" controls />
            )}
            <button type="button" onClick={handleClearPreview}>ล้าง</button>
          </div>
        )}
        <input type="text" value={messageText} onChange={handleTextChange} />
        <input type="file" accept="image/*,video/*" onChange={handleFileChange} ref={fileInputRef} style={{ display: "none" }} />
        <button type="button" onClick={handleFileClick} className="image-upload-button">
          <FaImage />
        </button>
        <button type='button' onClick={handleResendPreviousFile} disabled={!previousFile}></button>
        <button type="submit" disabled={!canSendMessage && !selectedFile && !previousFile}>ส่ง</button> {/* Changed */}
      </form>
    </div>
  );
}

export default ChatWindow;

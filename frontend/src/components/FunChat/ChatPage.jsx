import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import SearchUser from './SearchUser';
import { useParams, useNavigate } from 'react-router-dom';
import './ChatPAge.css'
function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const token = localStorage.getItem('token');
  const { chatId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/chats', {
          headers: { 'x-auth-token': token },
        });
        setChats(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchChats();
  }, [token]);

  useEffect(() => {
    if (chatId) {
      // if chatid is 'new', it means we are creating a new chat.
      if (chatId === 'new') {
        setSelectedChat('new');
      } else {
        const fetchChat = async () => {
          try {
            const res = await axios.get(`http://localhost:5000/api/chats/${chatId}`, {
              headers: { 'x-auth-token': token },
            });
            setSelectedChat(res.data);
          } catch (err) {
            console.error(err);
          }
        };
        fetchChat();
      }
    } else {
      setSelectedChat(null);
    }
  }, [chatId, token]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/chat/${chat._id}`);
  };

  const handleCreateNewChat = () => {
    setSelectedChat('new');
    navigate(`/chat/new`);
  };

  return (
    
    <div className="chat-page">
      <div className="chat-sidebar">
        <h2>Chats</h2>
        <button onClick={handleCreateNewChat}>New Chat</button>
        <ChatList chats={chats} onChatSelect={handleChatSelect} setChats={setChats} />
      </div>
      <div className="chat-content">
        {selectedChat === 'new' ? (
          <SearchUser setChats={setChats} />
        ) : selectedChat ? (
          <ChatWindow chat={selectedChat} setChat={setSelectedChat} />
        ) : (
          <SearchUser setChats={setChats} /> //โชร์ประวัติ
        )}
      </div>
    </div>
  );
}

export default ChatPage;

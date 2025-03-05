import React from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

function ChatList({ chats, onChatSelect, setChats }) {
  const userId = localStorage.getItem('user');
  const token = localStorage.getItem('token');

  const handleDeleteChat = async (chatId) => {
    try {
      await axios.delete(`http://localhost:5000/api/chats/${chatId}`, {
        headers: { 'x-auth-token': token },
      });
      // Update แชท
      const res = await axios.get('http://localhost:5000/api/chats', {
        headers: { 'x-auth-token': token },
      });
      setChats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="chat-list">
      <ul>
        {chats.map((chat) => (
          <li key={chat._id} >
            <div onClick={() => onChatSelect(chat)} className='user-chat'>
                {chat.users.filter(user => user._id !== userId).map((user) => (
                    <span key={user._id}>{user.username}</span>
                ))}
            </div>
            <button className='delete-button' onClick={() => handleDeleteChat(chat._id)}>
              <FaTrash />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;

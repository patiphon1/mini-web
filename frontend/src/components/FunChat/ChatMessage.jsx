import React from 'react';
import moment from 'moment';
import './ChatMessage.css';

function ChatMessage({ message, userId }) {
  const isCurrentUser = message.sender._id === userId;
  const messageClass = isCurrentUser ? 'received' : 'sent';
  const defaultProfileUrl = 'http://localhost:5000/uploads/default-profile.png';

  return (
    <div className={`message ${messageClass}`}>
      {!isCurrentUser && (
        <div className="message-header">
          <img
            src={message.sender.profilePicture ? `http://localhost:5000${message.sender.profilePicture}` : defaultProfileUrl}
            alt="User Profile"
            className="profile-picture-message"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultProfileUrl;
            }}
          />
          <span className="message-sender">{message.sender.username}</span>
        </div>
      )}
      <div className="message-content">
        {message.text && <p>{message.text}</p>}
        {message.imageUrl && (
          <img src={`http://localhost:5000${message.imageUrl}`} alt="Uploaded" className="uploaded-image" />
        )}
         {message.videoUrl && (
            <video controls className="uploaded-video">
              <source src={`http://localhost:5000${message.videoUrl}`} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
      </div>
      <div className='message-time'>
        {moment(message.createdAt).format('HH:mm')}
      </div>
    </div>
  );
}

export default ChatMessage;

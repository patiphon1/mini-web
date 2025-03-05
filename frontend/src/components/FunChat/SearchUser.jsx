import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SearchUser({setChats}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/search?username=${searchQuery}`,{
        headers:{'x-auth-token': token}
      });
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateChat = async (userId) => {
    try {
        const res = await axios.post('http://localhost:5000/api/chats', { recipientId: userId }, {
            headers: { 'x-auth-token': token },
        });
        // update chatlist
        const resChats = await axios.get('http://localhost:5000/api/chats', {
            headers: { 'x-auth-token': token },
          });
        setChats(resChats.data);
        navigate(`/chat/${res.data._id}`);
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="search-user">
      <h2>Search User</h2>
      <input
        type="text"
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
      <ul>
        {searchResults.map((user) => (
          <li key={user._id} onClick={() => handleCreateChat(user._id)}>
             {user.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchUser;

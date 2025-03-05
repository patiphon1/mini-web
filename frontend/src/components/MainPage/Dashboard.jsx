import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import './dashboard.css';
import moment from 'moment';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

function Dashboard() {
  const [data, setData] = useState({});
  const [posts, setPosts] = useState([]);
  const [postText, setPostText] = useState('');
  const [file, setFile] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCommentInput, setShowCommentInput] = useState({}); // Track which post has comment input visible
  const navigate = useNavigate();
  const token = localStorage.getItem('token');


  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('http://localhost:5000/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    axios
      .get('http://localhost:5000/api/protected', {
        headers: {
          'x-auth-token': token,
        },
      })
      .then((response) => {
        setData(response.data);
        console.log('Protected data:', response.data);
      })
      .catch((error) => {
        console.error('Error:', error.response?.data || error.message);
      });
  }, [token]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData();
    formData.append('text', postText);
    if (file) formData.append('file', file);

    try {
      const res = await axios.post('http://localhost:5000/api/posts', formData, {
        headers: {
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchPosts();
      setPostText('');
      setFile(null);
    } catch (err) {
      console.error('Failed to create post:', err);
      setError('Failed to create post.');
    }
  };

  const handleLike = async (postId) => {
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/likes/${postId}`,
        {},
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: res.data.likes } : post
        )
      );
    } catch (error) {
      console.error('Failed to like post:', error);
      setError('Failed to like post.');
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!commentText.trim()) {
      alert('Please write a comment!');
      return;
    }
    setError(null);
    try {
      const res = await axios.post(
        `http://localhost:5000/api/comments/${postId}`,
        { text: commentText },
        {
          headers: {
            'x-auth-token': token,
          },
        }
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, res.data],
              }
            : post
        )
      );
      setCommentText('');
      setShowCommentInput({ ...showCommentInput, [postId]: false }); // Hide comment input after submit
    } catch (error) {
      console.error('Failed to comment on post:', error);
      setError('Failed to comment on post.');
    }
  };

  const toggleCommentInput = (postId) => {
    setShowCommentInput({
      ...showCommentInput,
      [postId]: !showCommentInput[postId],
    });
  };

  return (
    <div>
      <Navbar />
      <div className="page-color">
      <div className="container max-w-3xl mx-auto">
      <div className="w-[65%] mx-auto p-4">
          <div className="post-form">
            <h2>Create a Post</h2>
            <form onSubmit={handlePostSubmit}>
              <textarea
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                placeholder="What's on your mind?"
                rows="2"
                className="form-control"
                required
              />
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files[0])}
                className="form-control mt-2"
              />
              <button type="submit" className="btn btn-primary w-100 mt-2">
                Post
              </button>
            </form>
          </div>
          {error && <div className="error-message">{error}</div>}
          {loading ? (
            <div className="loading">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="no-posts">No posts yet!</div>
          ) : (
            posts.map((post) => (
              <div key={post._id} className="post">
                <div className="user-info">
                  {/* Check if post.user exists before accessing its properties */}
                  {post.user && post.user.profilePicture && (
                    <img
                      src={`http://localhost:5000${post.user.profilePicture}`}
                      alt="User Profile"
                      className="profile-picture"
                    />
                  )}
                  <div className="user-detail">
                  {/* Check if post.user exists before accessing its properties */}
                  {post.user &&(
                    <p className="username">{post.user.username}</p>
                    )}
                    <p className="post-time">
                      {moment(post.createdAt).format(
                        'DD MMMM , YYYY, h:mm A'
                      )}
                    </p>
                  </div>
                </div>
                <p>{post.text}</p>
                {post.image && (
                  <div>
                    {post.image.endsWith('.mp4') ||
                    post.image.endsWith('.mov') ? (
                      <video width="300" controls>
                        <source src={`http://localhost:5000${post.image}`} />
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <img
                        src={`http://localhost:5000${post.image}`}
                        alt="Post"
                        width="300"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/path/to/default-image.jpg';
                        }}
                      />
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <button
                    className="like-button"
                    onClick={() => handleLike(post._id)}
                  >
                    {post.likes.includes(data.user?.id) ? (
                      <FaHeart className="text-red-500" /> // Filled heart if liked
                    ) : (
                      <FaRegHeart /> // Empty heart if not liked
                    )}
                  </button>
                  <span>Likes: {post.likes.length}</span>
                  <button
                    onClick={() => toggleCommentInput(post._id)}
                    className="comment-button"
                  >
                    Comment
                  </button>
                </div>
                {showCommentInput[post._id] && (
                  <div className="comment-input">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..."
                    />
                    <button
                      onClick={() => handleCommentSubmit(post._id)}
                      className="comment-submit-button"
                    >
                      Comment
                    </button>
                  </div>
                )}

                <ul>
                  {post.comments.map((comment) => (
                    <li key={comment._id}>
                      {comment.user && <span>{comment.user.username}: </span>}
                      {comment.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default Dashboard;

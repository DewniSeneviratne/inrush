import React, { useEffect, useState } from 'react';
import './PostCard.css';
import axiosInstance from '/Surge/inrush/frontend/src/axiosInstance';

const PostCard = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.likedByCurrentUser); 

  useEffect(() => {
    setIsLiked(post.likedByCurrentUser);
  }, [post.likedByCurrentUser]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
    if (diffDays === 0) {
      return '1d';
    } else {
      return `${diffDays}d`;
    }
  };
  

  
  const handleLikeClick = async () => {
    try {
      //if post already liked
      if (isLiked) return;

      // api call to like 
      const response = await axiosInstance.post(`/api/posts/like/${post.id}`, {}, {
        withCredentials: true,
      });

      
      if (response.status === 200) {
        setIsLiked(true);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div className="post-card">
      <div className="post-image">
        <img src={post.contentURL} alt="Post" />
      </div>
      <div className="post-content">
        <p>{post.caption}</p>
      </div>
      <div className="post-footer">
        <div className="post-meta">
          <span className="username">{post.userFirstName}</span>
          <span className="post-time">{formatDate(post.createdAt)}</span>
        </div>
       
            <button
              className="love-button"
              onClick={handleLikeClick}>
              <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
            </button>
      </div>


    </div>
  );
};

export default PostCard;

import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import PostCard from './PostCard';
import './PostList.css';
import axiosInstance from '/Surge/inrush/frontend/src/axiosInstance';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    caption: '',
    contentFile: null,
  });

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axiosInstance.get('/api/posts/list', {
          withCredentials: true,
        });
        console.log("hello");
        setPosts(response.data);
        console.log(response.data);
        
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  const handleFileChange = (e) => {
    setNewPost({
      ...newPost,
      contentFile: e.target.files[0],
    });
  };

  const handleCaptionChange = (e) => {
    setNewPost({
      ...newPost,
      caption: e.target.value,
    });
  };

  const handleAddPost = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('caption', newPost.caption);
    if (newPost.contentFile) {
      formData.append('contentFile', newPost.contentFile);
    }
    

    try {
      const response = await axiosInstance.post('/api/posts/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        setPosts((prevPosts) => [response.data, ...prevPosts]);
        setNewPost({ caption: '', contentFile: null });
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error adding post:', error);
    }
};

  return (
    <div className="post-list-container">
    <div className="left-space">
      <div className="logo-container">
        <h1>Inrush</h1>
        <img
          src="https://inrushbucket.s3.eu-north-1.amazonaws.com/inrushLogo.png"
          alt="Inrush Logo"
        />
      </div>
    </div>

    <div className="post-list">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
    <div className="right-space">
        <div className="profile-picture-container">
          {posts.length > 0 && posts[0].loggedInUserProfilePictureUrl ? (
            <img
              src={posts[0].loggedInUserProfilePictureUrl}
              alt="Profile"
            />
          ) : (
            <img
              src=""
              alt="Default Profile"
            />
          )}
          
          <div className="profile-name">
            {posts.length > 0 && posts[0].loggedInUserFirstName && posts[0].loggedInUserLastName ? (
              <p>{`${posts[0].loggedInUserFirstName} ${posts[0].loggedInUserLastName}`}</p>
            ) : (
              <p>Unknown User</p>
            )}
          </div>
        </div>
      </div>

    <Button
      variant="primary"
      className="add-post-button"
      onClick={handleModalShow}
    >
      <i className="bi bi-plus"></i>
    </Button>

    {/* Add post modal popup */}
    <Modal show={showModal} onHide={handleModalClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleAddPost}>
          <Form.Group controlId="formCaption" className="mb-3">
            <Form.Label>Caption</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter caption"
              value={newPost.caption}
              onChange={handleCaptionChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Image</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Add Post
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  </div>
  );
};

export default PostList;

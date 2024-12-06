import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import moment from 'moment';
import AdNavBar from "../../components/AdNavBar";
import "./AdHome.css";
import TrafficLights from "../../components/TrafficLights";

const AdHome = () => {
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [currentPostOwner, setCurrentPostOwner] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [loggedInAdmin, setLoggedInAdmin] = useState(null);
  const [loggedInSuperUser, setLoggedInSuperUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false);
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [adminProfilePictures, setAdminProfilePictures] = useState({});
  const [superUserProfilePictures, setSuperUserProfilePictures] = useState({});
  const [showCloseButton, setShowCloseButton] = useState(false);
  const defaultProfile = '/default.png';

  const fileInputRef = useRef(null);

  const getPostImage = (post) => {
    if (!post.image) return null;
    
    if (post.image.startsWith('data:')) {
      return post.image;
    }
    
    if (post.image.startsWith('http')) {
      return post.image;
    }
    
    return `http://localhost:8080${post.image}`;
  };

  useEffect(() => {
    const fetchLoggedInAdmin = async () => {
      try {
        const storedAdmin = JSON.parse(localStorage.getItem("loggedInAdmin"));
        if (!storedAdmin?.adminname) return;
        const response = await axios.get(`http://localhost:8080/admin/getByAdminname?adminname=${storedAdmin.adminname}`);
        const adminData = response.data;
        if (adminData?.adminId) {
          setLoggedInAdmin(adminData);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    };
    fetchLoggedInAdmin();
  }, []);

  useEffect(() => {
    const fetchLoggedInSuperUser = async () => {
      const storedSuperUser = JSON.parse(localStorage.getItem("loggedInSuperUser"));
      if (storedSuperUser?.superusername) {
        try {
          const response = await axios.get(`http://localhost:8080/superuser/getBySuperUsername?superusername=${storedSuperUser.superusername}`);
          setLoggedInSuperUser(response.data);
        } catch (error) {
          console.error("Error fetching superuser data:", error);
        }
      }
    };
    fetchLoggedInSuperUser();
  }, []);

  const fetchAdminProfilePicture = useCallback(async (adminId) => {
    if (!adminId) return;
    try {
      const response = await fetch(`http://localhost:8080/admin/profile/getProfilePicture/${adminId}`);
      const imageBlob = response.ok ? await response.blob() : null;
      setAdminProfilePictures(prev => ({ 
        ...prev, 
        [adminId]: imageBlob ? URL.createObjectURL(imageBlob) : defaultProfile 
      }));
    } catch (error) {
      console.error('Error fetching admin profile picture:', error);
      setAdminProfilePictures(prev => ({ ...prev, [adminId]: defaultProfile }));
    }
  }, []);

  const fetchSuperUserProfilePicture = useCallback(async (superuserId) => {
    if (!superuserId) return;
    try {
      const response = await fetch(`http://localhost:8080/superuser/profile/getProfilePicture/${superuserId}`);
      const imageBlob = response.ok ? await response.blob() : null;
      setSuperUserProfilePictures(prev => ({ 
        ...prev, 
        [superuserId]: imageBlob ? URL.createObjectURL(imageBlob) : defaultProfile 
      }));
    } catch (error) {
      console.error('Error fetching superuser profile picture:', error);
      setSuperUserProfilePictures(prev => ({ ...prev, [superuserId]: defaultProfile }));
    }
  }, []);

  useEffect(() => {
    if (loggedInAdmin?.adminId) {
      fetchAdminProfilePicture(loggedInAdmin.adminId);
    }
    if (loggedInSuperUser?.superuserId) {
      fetchSuperUserProfilePicture(loggedInSuperUser.superuserId);
    }
  }, [loggedInAdmin, loggedInSuperUser, fetchAdminProfilePicture, fetchSuperUserProfilePicture]);

  useEffect(() => {
    const fetchPostsAndPictures = async () => {
      try {
        const response = await axios.get("http://localhost:8080/posts/visible");
        if (response.data) {
          console.log('Raw posts data:', response.data); // Debug log
          const processedPosts = response.data.map(post => {
            console.log('Individual post:', post); // Debug each post
            console.log('isSubmittedReport:', post.isSubmittedReport);
            console.log('status:', post.status);
            return {
              ...post,
              image: post.image ? getPostImage(post) : null,
              timestamp: moment(post.timestamp).local()
            };
          });
          const sortedPosts = processedPosts.sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
          );
          setPosts(sortedPosts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPostsAndPictures();
  }, []);

  const handlePostInputChange = (e) => {
    const content = e.target.value;
    setNewPostContent(content);
    setShowCloseButton(content.length > 0 || imagePreview !== null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert("File is too large. Maximum size is 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setShowCloseButton(true);
      };
      reader.onerror = () => {
        console.error('FileReader error:', reader.error);
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCloseImagePreview = () => {
    setImagePreview(null);
    setShowCloseButton(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNewPostContent((prevContent) => prevContent + " " + transcript);
    };
    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error);
    };
    recognition.start();
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!newPostContent && !imagePreview) {
      alert("Please enter a post or select a picture before submitting.");
      return;
    }

    if (!loggedInAdmin) {
      alert("Please log in to post.");
      return;
    }

    const newPost = {
      content: newPostContent,
      image: imagePreview,
      adminId: loggedInAdmin.adminId,
      fullname: loggedInAdmin.fullname,
      idnumber: loggedInAdmin.idnumber,
      isVerified: false,
      likes: 0,
      dislikes: 0,
      userRole: "ADMIN"
    };

    try {
      const response = await axios.post("http://localhost:8080/posts/add", newPost, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const createdPost = {
        ...response.data,
        image: response.data.image ? getPostImage(response.data) : null
      };

      setPosts(prevPosts => [createdPost, ...prevPosts]);
      setNewPostContent("");
      setSelectedFile(null);
      setImagePreview(null);
      setShowCloseButton(false);
    } catch (error) {
      console.error("Error posting data:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/like`, {}, {
        params: {
          userId: loggedInAdmin?.adminId || loggedInSuperUser?.superuserId,
          userRole: loggedInAdmin ? "ADMIN" : "SUPERUSER"
        }
      });
      const updatedPost = {
        ...response.data,
        image: response.data.image ? getPostImage(response.data) : null
      };
      setPosts(posts.map(post => post.postId === postId ? updatedPost : post));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };
  
  const handleDislike = async (postId) => {
    try {
      const response = await axios.post(`http://localhost:8080/posts/${postId}/dislike`, {}, {
        params: {
          userId: loggedInAdmin?.adminId || loggedInSuperUser?.superuserId,
          userRole: loggedInAdmin ? "ADMIN" : "SUPERUSER"
        }
      });
      const updatedPost = {
        ...response.data,
        image: response.data.image ? getPostImage(response.data) : null
      };
      setPosts(posts.map(post => post.postId === postId ? updatedPost : post));
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const handleOpenComments = async (postId) => {
    setCurrentPostId(postId);
    try {
      const [commentsResponse, postResponse] = await Promise.all([
        axios.get(`http://localhost:8080/comments/${postId}`),
        axios.get(`http://localhost:8080/posts/${postId}`)
      ]);
      const sortedComments = commentsResponse.data
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(comment => ({
          ...comment,
          relativeTime: moment(comment.timestamp).fromNow()
        }));
      setComments(sortedComments);
      setCurrentPostOwner(postResponse.data.adminId);
    } catch (error) {
      console.error("Error fetching comments or post details:", error);
    }
    setIsCommentDialogOpen(true);
  };

  const handleCloseComments = () => {
    setIsCommentDialogOpen(false);
    setCurrentPostId(null);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') return;

    const comment = {
      content: newComment,
      postId: currentPostId,
      adminId: loggedInAdmin.adminId,
      fullname: loggedInAdmin.fullname,
      idnumber: loggedInAdmin.idnumber,
    };

    try {
      const response = await axios.post('http://localhost:8080/comments/add', comment);
      const newCommentWithRelativeTime = {
        ...response.data,
        relativeTime: moment(response.data.timestamp).fromNow()
      };
      setComments(prevComments => [newCommentWithRelativeTime, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeletePost = (postId) => {
    if (!loggedInAdmin) {
      alert("Please log in to delete posts.");
      return;
    }
    setItemToDelete(postId);
    setIsDeletePostDialogOpen(true);
  };

  const handleDeleteComment = (commentId, commentAdminId) => {
    if (!loggedInAdmin) {
      alert("Please log in to delete comments.");
      return;
    }
    if (loggedInAdmin.adminId === commentAdminId || loggedInAdmin.adminId === currentPostOwner) {
      setItemToDelete(commentId);
      setIsDeleteCommentDialogOpen(true);
    } else {
      alert("You don't have permission to delete this comment.");
    }
  };

  const confirmDeletePost = async () => {
    try {
      await axios.delete(`http://localhost:8080/posts/${itemToDelete}`);
      setPosts(posts.filter(post => post.postId !== itemToDelete));
      setIsDeletePostDialogOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const confirmDeleteComment = async () => {
    try {
      await axios.delete(`http://localhost:8080/comments/${itemToDelete}`, {
        params: {
          adminId: loggedInAdmin.adminId
        }
      });
      setComments(comments.filter(comment => comment.commentId !== itemToDelete));
      setIsDeleteCommentDialogOpen(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. You may not have permission.");
    }
  };

  const formatTimestamp = (timestamp) => {
    const momentDate = moment(timestamp);
    return momentDate.local().format('dddd, MMMM D, YYYY [at] h:mm A');
  };
  
  const getRelativeTime = (timestamp) => {
    return moment(timestamp).local().fromNow();
  };

  const handleClosePost = () => {
    setNewPostContent('');
    setImagePreview(null);
    setShowCloseButton(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="adhome">
      <AdNavBar />
      <div className="header-wrapper">
        <b className="TitleWildcat">WILDCAT</b>
      </div>

      <div className="content-wrapper">
        <div className="post-container">
          <div className="post-form">
            <div className="profile-picture-wrapper">
              <img
                src={
                  loggedInAdmin
                    ? adminProfilePictures[loggedInAdmin.adminId] || defaultProfile
                    : loggedInSuperUser
                    ? superUserProfilePictures[loggedInSuperUser.superuserId] || defaultProfile
                    : defaultProfile
                }
                alt="Profile"
                className="profile-picture"
              />
            </div>

            <form onSubmit={handlePostSubmit}>
              <div className="input-container">
                <input
                  type="text"
                  className="post-input"
                  value={newPostContent}
                  onChange={handlePostInputChange}
                  placeholder="What's happening in your day, Wildcat?"
                />
                {showCloseButton && (
                  <button type="button" className="close-button" onClick={handleClosePost}>
                    ×
                  </button>
                )}
              </div>
              <div className="post-subcontainer">
                <div className="post-subcontainer-icons">
                  <label htmlFor="file-upload">
                    <img className="gallery-icon" alt="" src="/gallery.png" />
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="file-input"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    onClick={(e) => { e.target.value = null }}
                  />
                  <img
                    className="mic-icon"
                    alt="Mic"
                    src="/mic.png"
                    onClick={handleMicClick}
                    style={{ cursor: "pointer" }}
                  />
                </div>
                <Button
                  type="submit"
                  className="post-button"
                  variant="contained"
                  sx={{
                    borderRadius: "10px",
                    width: 60,
                    height: 30,
                    backgroundColor: "#8A252C",
                    "&:hover": { backgroundColor: "#A91D3A" }
                  }}
                >
                  POST
                </Button>
              </div>
            </form>
            {imagePreview && (
              <div className="image-preview">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ maxWidth: '200px', height: 'auto' }}
                />
                <button onClick={handleCloseImagePreview}>Remove Image</button>
              </div>
            )}
          </div>
        </div>

        <div className="post-list">
          {posts.map((post) => (
            <div key={post.postId} className="post-card">
              <div className="card-container" style={{ position: 'relative' }}>
              {post.isSubmittedReport && post.status && (loggedInAdmin || loggedInSuperUser) && (
   <div className="traffic-light-container">
   <TrafficLights 
     status={post.status} // This will be mapped inside TrafficLights component
     isClickable={false}
     onChange={() => {}} // Empty function since it's not clickable
   />
 </div>
)}

                <div className="name-container">
                  <img
                    src={
                      post.adminId
                        ? adminProfilePictures[post.adminId] || defaultProfile
                        : superUserProfilePictures[post.superuserId] || defaultProfile
                    }
                    alt="Profile Avatar"
                    className="admins-dp"
                  />
                  <h5>{post.fullname} ({post.idnumber})</h5>
                  {loggedInAdmin && loggedInAdmin.adminId === post.adminId && (
                    <img
                      src="/delete.png"
                      alt="Delete"
                      className="delete-icon"
                      onClick={() => handleDeletePost(post.postId)}
                      style={{ cursor: 'pointer', width: '20px', height: '20px', marginLeft: 'auto' }}
                    />
                  )}
                </div>
                <div className="timestamp">
                  <span className="formatted-date">{formatTimestamp(post.timestamp)}</span>
                  <br />
                  <span className="relative-time">{getRelativeTime(post.timestamp)}</span>
                </div>
                <div className="card-contents">
                  <p>{post.content}</p>
                  {post.image && (
                    <img
                      className="post-image"
                      alt="Post"
                      src={getPostImage(post)}
                      onError={(e) => {
                        console.error('Error loading image:', post.image);
                        e.target.style.display = 'none';
                      }}
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }}
                    />
                  )}
                </div>
                <div className="footer-line" />
                <div className="footer-actions">
                  <div className="footer-icons">
                    <button 
                      onClick={() => handleLike(post.postId)} 
                      className={`like-button ${post.likedBy && post.likedBy.includes(loggedInAdmin?.adminId) ? 'active' : ''}`}
                    >
                      <img src="/t-up.png" alt="Thumbs Up" /> {post.likes}
                    </button>
                    <button 
                      onClick={() => handleDislike(post.postId)} 
                      className={`dislike-button ${post.dislikedBy && post.dislikedBy.includes(loggedInAdmin?.adminId) ? 'active' : ''}`}
                    >
                      <img src="/t-down.png" alt="Thumbs Down" /> {post.dislikes}
                    </button>
                  </div>
                  <div className="footer-comments">
                    <button className="comment-button" onClick={() => handleOpenComments(post.postId)}>
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isCommentDialogOpen} onClose={handleCloseComments}>
        <DialogTitle>
          Comments
          <img
            src="/exit.png"
            alt="Close"
            className="exit-icon"
            onClick={handleCloseComments}
          />
        </DialogTitle>
        <DialogContent>
          {comments.map((comment) => (
            <div key={comment.commentId} className="comment">
              <div className="comment-header">
                <div className="admin-info-container">
                  <span className="admin-info">
                    {comment.fullname} ({comment.idnumber})
                  </span>
                  {(loggedInAdmin && (loggedInAdmin.adminId === comment.adminId || loggedInAdmin.adminId === currentPostOwner)) && (
                    <img
                      src="/delete.png"
                      alt="Delete"
                      className="delete-icon"
                      onClick={() => handleDeleteComment(comment.commentId, comment.adminId)}
                    />
                  )}
                </div>
                <div className="timestamp-container">
                  <span className="formatted-time">{formatTimestamp(comment.timestamp)}</span>
                  <span className="relative-time">{comment.relativeTime}</span>
                </div>
              </div>
              <p>{comment.content}</p>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <div className="add-comment" style={{ display: 'flex', width: '100%', padding: '10px' }}>
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              style={{ 
                flexGrow: 1, 
                marginRight: '10px', 
                padding: '8px', 
                border: '1px solid #ccc', 
                borderRadius: '4px' 
              }}
            />
            <Button 
              onClick={handleAddComment}
              variant="contained"
              sx={{ 
                backgroundColor: '#8A252C', 
                color: 'white',
                '&:hover': {
                  backgroundColor: '#f9d67b',
                  color: 'black'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Comment
            </Button>
          </div>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeletePostDialogOpen} onClose={() => setIsDeletePostDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this post?
        </DialogContent>
        <DialogActions className="delete-dialog-actions">
          <Button onClick={() => setIsDeletePostDialogOpen(false)} className="cancel-button">Cancel</Button>
          <Button onClick={confirmDeletePost} className="delete-button">Delete</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteCommentDialogOpen} onClose={() => setIsDeleteCommentDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this comment?
        </DialogContent>
        <DialogActions className="delete-dialog-actions">
          <Button onClick={() => setIsDeleteCommentDialogOpen(false)} className="cancel-button">Cancel</Button>
          <Button onClick={confirmDeleteComment} className="delete-button">Delete</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AdHome;
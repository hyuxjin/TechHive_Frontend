import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "../../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import { Radio, RadioGroup, FormControlLabel, FormControl } from "@mui/material";
import Loadable from 'react-loadable';
import moment from 'moment';
import "./WSHomepage.css";

// eslint-disable-next-line no-unused-vars
const WSComment = Loadable({
  loader: () => import('./WSComment'),
  loading: () => <div>Loading...</div>,
});

const WSHomepage = () => {
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null); // eslint-disable-line no-unused-vars
  const [imagePreview, setImagePreview] = useState(null);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [currentPostOwner, setCurrentPostOwner] = useState(null);
  const [comments, setComments] = useState([]);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false);
  const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null); // State to hold profile picture
  const [userProfilePictures, setUserProfilePictures] = useState({});
  const defaultProfile = '/dp.png'; // Path to the default profile picture

  const [inputHasContent, setInputHasContent] = useState(false); // eslint-disable-line no-unused-vars
  const [showCancelButton, setShowCancelButton] = useState(false); // eslint-disable-line no-unused-vars
  const [showCloseButton, setShowCloseButton] = useState(false); // eslint-disable-line no-unused-vars

  // State for modals
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);


  useEffect(() => {
    const fetchLoggedInUser = async () => {
      const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
      if (storedUser && storedUser.username) {
        try {
          const response = await axios.get(`/user/getByUsername?username=${storedUser.username}`);
          setLoggedInUser(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    fetchLoggedInUser();
  }, []);

  const fetchUserProfilePicture = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/user/profile/getProfilePicture/${userId}`);
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setUserProfilePictures(prev => ({ ...prev, [userId]: imageUrl }));
      } else {
        setUserProfilePictures(prev => ({ ...prev, [userId]: defaultProfile }));
      }
    } catch (error) {
      console.error('Failed to fetch user profile picture:', error);
      setUserProfilePictures(prev => ({ ...prev, [userId]: defaultProfile }));
    }
  }, []);

  useEffect(() => {
    if (loggedInUser) {
      console.log("Checking permissions for user:", loggedInUser.userId); // Debug log
  
      const userPermissionsKey = `userPermissionsSet_${loggedInUser.userId}`;
      const hasSetPermissions = localStorage.getItem(userPermissionsKey);
  
      console.log("Has set permissions:", hasSetPermissions); // Debug log
  
      const locationPermission = localStorage.getItem(`locationPermission_${loggedInUser.userId}`);
      const cameraPermission = localStorage.getItem(`cameraPermission_${loggedInUser.userId}`);
  
      console.log("Location permission:", locationPermission); // Debug log
      console.log("Camera permission:", cameraPermission); // Debug log
  
      if (!hasSetPermissions) {
        if (!locationPermission) {
          setIsLocationDialogOpen(true);
        } else if (!cameraPermission) {
          setIsCameraDialogOpen(true);
        }
      }
    }
  }, [loggedInUser]);
  
  const handleLocationPermission = (permission) => {
    console.log("Setting location permission:", permission); // Debug log
  
    if (loggedInUser) {
      localStorage.setItem(`locationPermission_${loggedInUser.userId}`, permission);
      setIsLocationDialogOpen(false);
  
      // Show camera dialog next
      setIsCameraDialogOpen(true);
    }
  };
  
  const handleCameraPermission = (permission) => {
    console.log("Setting camera permission:", permission); // Debug log
  
    if (loggedInUser) {
      localStorage.setItem(`cameraPermission_${loggedInUser.userId}`, permission);
      setIsCameraDialogOpen(false);
  
      // Mark all permissions as complete
      localStorage.setItem(`userPermissionsSet_${loggedInUser.userId}`, "true");
    }
  };
  
  useEffect(() => {
    const fetchPostsAndPictures = async () => {
      try {
        const response = await axios.get("/posts");
        // Sort posts by timestamp in descending order to show the newest first
        const sortedPosts = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts(sortedPosts);

        // Fetch profile pictures for each post owner
        const userIds = new Set(sortedPosts.map(post => post.userId));
        userIds.forEach(userId => fetchUserProfilePicture(userId));
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPostsAndPictures();
  }, [fetchUserProfilePicture]);



  useEffect(() => {
    if (currentPostId) {
      const fetchCommentsAndPictures = async () => {
        try {
          const [commentsResponse, postResponse] = await Promise.all([
            axios.get(`/comments/${currentPostId}`),
            axios.get(`/posts/${currentPostId}`)
          ]);

          const sortedComments = commentsResponse.data
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(comment => {
              // Truncate the microseconds to milliseconds for moment.js compatibility
              const truncatedTimestamp = comment.timestamp.substring(0, 23); // Keep only up to milliseconds

              // Pass the truncated timestamp to moment
              const momentTimestamp = moment(truncatedTimestamp, 'YYYY-MM-DD HH:mm:ss.SSS');

              console.log("Comment raw timestamp:", comment.timestamp); // Log the raw timestamp
              console.log("Truncated timestamp:", truncatedTimestamp); // Log the truncated timestamp
              console.log("Formatted timestamp for comment:", momentTimestamp.format()); // Log formatted timestamp

              return {
                ...comment,
                relativeTime: momentTimestamp.isValid() ? momentTimestamp.fromNow() : "Invalid date"
              };
            });

          setComments(sortedComments);
          setCurrentPostOwner(postResponse.data.userId);
        } catch (error) {
          console.error("Error fetching comments or post details:", error);
        }
      };
      fetchCommentsAndPictures();
    }
  }, [currentPostId, fetchUserProfilePicture]);

  const renderTrafficLights = (status) => { 
    console.log('Rendering traffic lights for status:', status); // Debug log 
    const trafficLights = [ 
        { color: 'maroon', label: 'Pending' }, 
        { color: 'white', label: 'Acknowledged' }, 
        { color: 'yellow', label: 'On-going' }, 
        { color: 'green', label: 'Resolved' }, 
    ]; 
 
    const currentStatus = status || "Pending";  
    return ( 
        <div className="traffic-lights-container"> 
            {trafficLights.map((light, index) => ( 
                <div 
                    key={index} 
                    className="traffic-light-circle" 
                    style={{ 
                        backgroundColor: currentStatus === light.label ? 
light.color : 'transparent', 
                        border: `2px solid ${light.color}`, 
                    }} 
                /> 
            ))} 
        </div> 
    ); 
}; 


  const fetchLoggedInUsers = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")) || null;
    setLoggedInUser(user);
    return user;
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/posts");
        const sortedPosts = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setPosts(sortedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      console.log("Speech recognition not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setComments(prevComments =>
        prevComments.map(comment => {
          const momentDate = moment(comment.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
          const isValidDate = momentDate.isValid();

          return {
            ...comment,
            relativeTime: isValidDate ? momentDate.fromNow() : 'Invalid date',
          };
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      );
    }, 60000); // Updates every minute

    return () => clearInterval(timer);
  }, []);

  const getPostImage = (post) => {
    if (!post.image) return null;
    
    // If the image path is already a relative URL (starts with '/'), use it as is
    if (post.image.startsWith('/')) {
      return post.image;
    }
    
    // For backward compatibility with existing posts
    if (post.image.startsWith('data:')) {
      return post.image;
    }
    
    // If it's a full system path, convert it to relative URL
    // This is a fallback for any existing data in the database
    if (post.image.includes('\\Upload_report\\')) {
      const parts = post.image.split('\\Upload_report\\');
      return `/Upload_report/${parts[1]}`;
    }
    
    return post.image;
  };

  const onREPORTSClick = useCallback(() => {
    navigate("/wsreport");
  }, [navigate]);

  const onPROFILEClick = useCallback(() => {
    navigate("/wsprofile");
  }, [navigate]);

  const onLEADERBOARDSClick = useCallback(() => {
    navigate("/wsleaderboards");
  }, [navigate]);

  const onINSIGHTClick = useCallback(() => {
    navigate("/insightanalytics");
  }, [navigate]);

  const handlePostInputChange = (e) => {
    const content = e.target.value;
    setNewPostContent(content);
    setShowCloseButton(content.length > 0 || imagePreview !== null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const maxFileSize = 1 * 1024 * 1024; // 1 MB in bytes

    if (file) {
      // Check if the file size is greater than 1 MB
      if (file.size > maxFileSize) {
        alert("File size exceeds 1 MB limit. Please select a smaller image."); // Alert message
        setSelectedFile(null);
        setImagePreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setShowCloseButton(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Function to fetch profile picture
  const fetchProfilePicture = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/user/profile/getProfilePicture/${userId}`);
      if (response.ok) {
        const imageBlob = await response.blob();
        if (imageBlob.size > 0) {
          const imageUrl = URL.createObjectURL(imageBlob);
          setProfilePicture(imageUrl);
        } else {
          setProfilePicture(defaultProfile);
        }
      } else {
        setProfilePicture(defaultProfile);
      }
    } catch (error) {
      console.error('Failed to fetch profile picture:', error);
      setProfilePicture(defaultProfile);
    }
  }, [defaultProfile]);


  // Fetch logged in user data and profile picture on component mount
  useEffect(() => {
    const user = fetchLoggedInUsers();
    if (user) {
      fetchProfilePicture(user.userId);
    }
  }, [fetchLoggedInUsers, fetchProfilePicture]);

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

    if (!loggedInUser) {
      alert("Please log in to post.");
      return;
    }

    const newPost = {
      content: newPostContent.trim() || '',  // Ensure content is empty if there's no text
      image: imagePreview,                   // The image preview (optional)
      userId: loggedInUser.userId,
      fullName: loggedInUser.fullName,
      idNumber: loggedInUser.idNumber,
      isVerified: false,
      likes: 0,
      dislikes: 0,
      points: 0,
      timestamp: new Date().toISOString(),   // Add timestamp at the time of creation
    };

    try {
      const response = await axios.post("/posts/add", newPost, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Sort the posts immediately after adding the new post
      setPosts(prevPosts => {
        const updatedPosts = [response.data, ...prevPosts];
        return updatedPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      });

      setNewPostContent("");  // Reset the content
      setSelectedFile(null);  // Clear the selected file
      setImagePreview(null);  // Clear the image preview
      setShowCloseButton(false);
    } catch (error) {
      console.error("Error posting data:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };


  const handleLike = async (postId) => {
    if (!loggedInUser) {
      alert("Please log in to like posts.");
      return;
    }
    try {
      const response = await axios.post(`/posts/${postId}/like?userId=${loggedInUser.userId}`);
      const updatedPost = response.data;
      setPosts(posts.map(post =>
        post.postId === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDislike = async (postId) => {
    if (!loggedInUser) {
      alert("Please log in to dislike posts.");
      return;
    }
    try {
      const response = await axios.post(`/posts/${postId}/dislike?userId=${loggedInUser.userId}`);
      const updatedPost = response.data;
      setPosts(posts.map(post =>
        post.postId === postId ? updatedPost : post
      ));
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const handleOpenComments = async (postId) => {
    setCurrentPostId(postId);
    try {
      const [commentsResponse, postResponse] = await Promise.all([
        axios.get(`/comments/${postId}`),
        axios.get(`/posts/${postId}`)
      ]);

      const sortedComments = commentsResponse.data
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(comment => {
          console.log("Raw timestamp:", comment.timestamp); // Log the raw timestamp
          const momentTimestamp = moment(comment.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
          console.log("Moment valid:", momentTimestamp.isValid()); // Log if the moment is valid
          console.log("Formatted timestamp:", momentTimestamp.format()); // Log the formatted timestamp

          return {
            ...comment,
            relativeTime: momentTimestamp.isValid() ? momentTimestamp.fromNow() : "Invalid date"
          };
        });

      setComments(sortedComments);
      setCurrentPostOwner(postResponse.data.userId);
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
      userId: loggedInUser.userId,
      fullName: loggedInUser.fullName,
      idNumber: loggedInUser.idNumber,
    };

    try {
      const response = await axios.post('/comments/add', comment);
      const newCommentWithRelativeTime = {
        ...response.data,
        relativeTime: moment().fromNow(),
        timestamp: moment().format('YYYY-MM-DD HH:mm:ss.SSSSSS')
      };
      setComments(prevComments => [newCommentWithRelativeTime, ...prevComments]);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
    }
  };

  const handleDeletePost = (postId) => {
    if (!loggedInUser) {
      alert("Please log in to delete posts.");
      return;
    }
    setItemToDelete(postId);
    setIsDeletePostDialogOpen(true);
  };

  const handleDeleteComment = (commentId, commentUserId) => {
    if (!loggedInUser) {
      alert("Please log in to delete comments.");
      return;
    }
    if (loggedInUser.userId === commentUserId || loggedInUser.userId === currentPostOwner) {
      setItemToDelete(commentId);
      setIsDeleteCommentDialogOpen(true);
    } else {
      alert("You don't have permission to delete this comment.");
    }
  };

  const confirmDeletePost = async () => {
    try {
      await axios.delete(`/posts/${itemToDelete}`);
      setPosts(posts.filter(post => post.postId !== itemToDelete));
      setIsDeletePostDialogOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const confirmDeleteComment = async () => {
    try {
      await axios.delete(`/comments/${itemToDelete}`, {
        params: {
          userId: loggedInUser.userId
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
    console.log("Raw timestamp:", timestamp); // Log the raw timestamp
    const momentDate = moment(timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');

    if (!momentDate.isValid()) {
      console.log("Invalid date format for:", timestamp); // Log if the date is invalid
      return "Invalid date"; // Handle invalid date
    }

    return momentDate.format('dddd, MMMM D, YYYY [at] h:mm A');
  };

  const getRelativeTime = (timestamp) => {
    console.log("Raw timestamp for relative time:", timestamp); // Log the raw timestamp for relative time
    const momentDate = moment(timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');

    if (!momentDate.isValid()) {
      console.log("Invalid date format for relative time:", timestamp); // Log if the date is invalid
      return "Invalid date"; // Handle invalid date
    }

    return momentDate.fromNow();
  };

  const handleClosePost = () => {
    setNewPostContent('');
    setImagePreview(null);
    setShowCloseButton(false);
    setInputHasContent(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const fileInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="ws-homepage">
      <div className="WSNavbar">
        <img className="WSTitle" alt="" src="/TITLE.png" />
        <div className="nav-links">
          <b className="NHome">Home</b>
          <div className="NReports" onClick={onREPORTSClick}>
            Report
          </div>
          <div className="NLeaderboards" onClick={onLEADERBOARDSClick}>
            Leaderboard
          </div>
          <div className="NInsight" onClick={onINSIGHTClick}>
            Insight
          </div>
          <div className="NProfile" onClick={onPROFILEClick}>
            Profile
          </div>
        </div>
        {/* Toggle Navigation Button for mobile */}
        <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-toggle-icon">
            <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
          </svg>
        </button>
        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <b className="NHome-mobile">Home</b>
              <div className="NReports-mobile" onClick={onREPORTSClick}>
                Report
              </div>
              <div className="NLeaderboards-mobile" onClick={onLEADERBOARDSClick}>
                Leaderboard
              </div>
              <div className="NInsight-mobile" onClick={onINSIGHTClick}>
                Insight
              </div>
              <div className="NProfile-mobile" onClick={onPROFILEClick}>
                Profile
              </div>
            </div>
          </div>
        )}
      </div>
      <b className="HWildcat">WILDCAT</b>

      <div className="content-wrapper">
        <div className="post-container">
          <div className="post-header">
            {showCloseButton && (
              <button className="close-button" onClick={handleClosePost}>
                ×
              </button>
            )}
          </div>
          <div className="logo-container">
            <img src={profilePicture || defaultProfile} alt="User Avatar" className="users-dp" />
          </div>
          <div className="post-form">
            <form onSubmit={handlePostSubmit}>
              <input
                type="text"
                className="post-input"
                value={newPostContent}
                onChange={handlePostInputChange}
                placeholder="What's happening in your day, Wildcat?"
              />
              <div className="post-subcontainer">
                <div className="post-subcontainer-icons">
                  <label htmlFor="file-upload">
                    <img className="gallery-icon" alt="" src="/gallery.png" />
                  </label>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
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
                    "&:hover": { backgroundColor: "#A91D3A" },
                    "&:disabled": { backgroundColor: "#cccccc", color: "#666666" }
                  }}
                >
                  POST
                </Button>
              </div>
            </form>
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px' }} />
              </div>
            )}
          </div>
        </div>
        <div className="post-list">
          {posts.map((post) => (
            <div key={post.postId} className="post-card"style={{ backgroundColor: post.isSubmittedReport ? '#f9d67b' : 'transparent' }}>

              {/* Render traffic lights only for submitted reports */} 
              {post.isSubmittedReport && renderTrafficLights(post.status)}

              <div className="card-container">
                <div className="name-container">
                  <img src={userProfilePictures[post.userId] || defaultProfile} alt="User Avatar" />
                  <h5>{post.fullName} ({post.idNumber})</h5>
                  {loggedInUser && loggedInUser.userId === post.userId && !post.isSubmittedReport && (
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
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                  )}
                </div>
                <div className="footer-line" />
                <div className="footer-actions">
                  <div className="footer-icons">
                    <button
                      onClick={() => handleLike(post.postId)}
                      className={`like-button ${post.likedBy.includes(loggedInUser?.userId) ? 'active' : ''}`}
                    >
                      <img src="/t-up.png" alt="Thumbs Up" /> {post.likes}
                    </button>
                    <button
                      onClick={() => handleDislike(post.postId)}
                      className={`dislike-button ${post.dislikedBy.includes(loggedInUser?.userId) ? 'active' : ''}`}
                    >
                      <img src="/t-down.png" alt="Thumbs Down" /> {post.dislikes}
                    </button>
                  </div>
                  <div className="footer-comments">
                    <button className="comment-button" onClick={() => handleOpenComments(post.postId)}>Comment</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals for Location and Camera Permissions */}
<Dialog
  open={isLocationDialogOpen}
  disableEscapeKeyDown={true} // Prevents closing with the Escape key
>
  <DialogTitle>Location Access</DialogTitle>
  <DialogContent>
    <p>We need location access to proceed. Choose an option:</p>
    <FormControl component="fieldset">
      <RadioGroup onChange={(e) => handleLocationPermission(e.target.value)}>
        <FormControlLabel
          value="whileUsing"
          control={<Radio sx={{ color: "#f6c301", "&.Mui-checked": { color: "#f6c301" } }} />}
          label="Allow location access while using the app"
        />
        <FormControlLabel
          value="always"
          control={<Radio sx={{ color: "maroon", "&.Mui-checked": { color: "maroon" } }} />}
          label="Allow location access always"
        />
        <FormControlLabel
          value="never"
          control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "gray" } }} />}
          label="Never allow location access"
        />
      </RadioGroup>
    </FormControl>
  </DialogContent>
</Dialog>

<Dialog
  open={isCameraDialogOpen}
  disableEscapeKeyDown={true} // Prevents closing with the Escape key
>
  <DialogTitle>Camera Access</DialogTitle>
  <DialogContent>
    <p>We need camera access to proceed. Choose an option:</p>
    <FormControl component="fieldset">
      <RadioGroup onChange={(e) => handleCameraPermission(e.target.value)}>
        <FormControlLabel
          value="whileUsing"
          control={<Radio sx={{ color: "#f6c301", "&.Mui-checked": { color: "#f6c301" } }} />}
          label="Allow camera access while using the app"
        />
        <FormControlLabel
          value="always"
          control={<Radio sx={{ color: "maroon", "&.Mui-checked": { color: "maroon" } }} />}
          label="Allow camera access always"
        />
        <FormControlLabel
          value="never"
          control={<Radio sx={{ color: "gray", "&.Mui-checked": { color: "gray" } }} />}
          label="Never allow camera access"
        />
      </RadioGroup>
    </FormControl>
  </DialogContent>
</Dialog>
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
                <div className="user-info-container">
                  <span className="user-info">
                    {comment.fullName} ({comment.idNumber})
                  </span>
                  {(loggedInUser && (loggedInUser.userId === comment.userId || loggedInUser.userId === currentPostOwner)) && (
                    <img
                      src="/delete.png"
                      alt="Delete"
                      className="delete-icon"
                      onClick={() => handleDeleteComment(comment.commentId, comment.userId)}
                    />
                  )}
                </div>
                <div className="timestamp-container">
                  <span className="formatted-time">
                    {formatTimestamp(comment.timestamp)}
                  </span>
                  <span className="relative-time">
                    {comment.relativeTime}
                  </span>
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

export default WSHomepage;

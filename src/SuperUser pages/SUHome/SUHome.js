import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import moment from 'moment';
import SUNavBar from "../../components/SUNavBar";
import "./SUHome.css";

const SUHome = () => {
    const navigate = useNavigate();
    const [isOverlayVisible, setOverlayVisible] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [posts, setPosts] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [currentPostOwner, setCurrentPostOwner] = useState(null);
    const [comments, setComments] = useState([]);
    const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
    const [loggedInSuperUser, setLoggedInSuperUser] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [isDeletePostDialogOpen, setIsDeletePostDialogOpen] = useState(false);
    const [isDeleteCommentDialogOpen, setIsDeleteCommentDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [profilePicture, setProfilePicture] = useState(null);
    const [superuserProfilePictures, setSuperUserProfilePictures] = useState({});
    const defaultProfile = '/default.png';
    const [inputHasContent, setInputHasContent] = useState(false);
    const [showCancelButton, setShowCancelButton] = useState(false);
    const [showCloseButton, setShowCloseButton] = useState(false);

    const fileInputRef = useRef(null);

    useEffect(() => {
        console.log("Fetching Logged In SuperUser");
        const fetchLoggedInSuperUser = async () => {
            const storedSuperUser = JSON.parse(localStorage.getItem("loggedInSuperUser"));
            console.log("Stored SuperUser:", storedSuperUser);
            
            if (storedSuperUser && storedSuperUser.superusername) {
                try {
                    const response = await axios.get(`https://techhivebackend-production-86d4.up.railway.app/superuser/getBySuperUsername?superusername=${storedSuperUser.superusername}`);
                    setLoggedInSuperUser(response.data);
                    console.log("Fetched superuser data:", response.data);
                } catch (error) {
                    console.error("Error fetching superuser data:", error);
                }
            }
        };
        fetchLoggedInSuperUser();    
    }, []);

    const fetchSuperUserProfilePicture = useCallback(async (superuserId) => {
        // Ensure superuserId is valid before making the request
        if (!superuserId || superuserId <= 0) {
            console.warn(`Invalid superuserId: ${superuserId}. Using default profile.`);
            setSuperUserProfilePictures(prev => ({ ...prev, [superuserId]: defaultProfile }));
            return;
        }
    
        try {
            const response = await fetch(`https://techhivebackend-production-86d4.up.railway.app/superuser/profile/getProfilePicture/${superuserId}`);
            if (response.ok) {
                const imageBlob = await response.blob();
                const imageUrl = URL.createObjectURL(imageBlob);
                setSuperUserProfilePictures(prev => ({ ...prev, [superuserId]: imageUrl }));
            } else {
                console.warn(`Profile picture not found for superuserId: ${superuserId}. Using default profile.`);
                setSuperUserProfilePictures(prev => ({ ...prev, [superuserId]: defaultProfile }));
            }
        } catch (error) {
            console.error(`Failed to fetch superuser profile picture for ID: ${superuserId}`, error);
            setSuperUserProfilePictures(prev => ({ ...prev, [superuserId]: defaultProfile }));
        }
    }, []);
    

  useEffect(() => {
    const fetchPostsAndPictures = async () => {
        try {
            const response = await axios.get("https://techhivebackend-production-86d4.up.railway.app/posts/visible");
            console.log("Fetched visible posts data:", response.data);  // Log fetched data
            const sortedPosts = response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            console.log("Sorted posts:", sortedPosts);  // Log sorted data
            setPosts(sortedPosts);

            const superuserIds = new Set(sortedPosts.map(post => post.superUserId));
            superuserIds.forEach(superuserId => fetchSuperUserProfilePicture(superuserId));
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };
    fetchPostsAndPictures();
}, [fetchSuperUserProfilePicture]);



    useEffect(() => {
        if (currentPostId) {
            const fetchCommentsAndPictures = async () => {
                try {
                    const [commentsResponse, postResponse] = await Promise.all([
                        axios.get(`https://techhivebackend-production-86d4.up.railway.app/comments/${currentPostId}`),
                        axios.get(`https://techhivebackend-production-86d4.up.railway.app/posts/${currentPostId}`)
                    ]);
                    const sortedComments = commentsResponse.data
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                        .map(comment => ({
                            ...comment,
                            relativeTime: moment(comment.timestamp).fromNow()
                        }));
                    setComments(sortedComments);
                    setCurrentPostOwner(postResponse.data.superuserId);

                    const commentSuperUserIds = new Set(sortedComments.map(comment => comment.superuserId));
                    commentSuperUserIds.forEach(superuserId => fetchSuperUserProfilePicture(superuserId));
                } catch (error) {
                    console.error("Error fetching comments or post details:", error);
                }
            };
            fetchCommentsAndPictures();
        }
    }, [currentPostId, fetchSuperUserProfilePicture]);

    const fetchLoggedInSuperUsers = useCallback(() => {
        const superuser = JSON.parse(localStorage.getItem("loggedInSuperUser")) || null;
        setLoggedInSuperUser(superuser);
        return superuser;
    }, []);

    const handlePostInputChange = (e) => {
      const content = e.target.value;
      setNewPostContent(content);
      setShowCloseButton(content.length > 0 || imagePreview !== null);
  };

  const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result);
              setShowCloseButton(true);
          };
          reader.readAsDataURL(file);
      }
  };

    const fetchProfilePicture = useCallback(async (superuserId) => {
        try {
            const response = await fetch(`https://techhivebackend-production-86d4.up.railway.app/superuser/profile/getProfilePicture/${superuserId}`);
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

    useEffect(() => {
        const superuser = fetchLoggedInSuperUsers();
        if (superuser) {
            fetchProfilePicture(superuser.superuserId);
        }
    }, [fetchLoggedInSuperUsers, fetchProfilePicture]);

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
    
      console.log("Logged In SuperUser:", loggedInSuperUser);
    
      if (!loggedInSuperUser || !loggedInSuperUser.superuserId) {
          alert("Please log in to post.");
          return;
      }
    
      // Log the post data before sending it
      const newPost = {
        content: newPostContent,
        image: imagePreview,
        superUserId: loggedInSuperUser.superuserId,
        fullName: loggedInSuperUser.fullName,
        idNumber: loggedInSuperUser.superuseridNumber,
        userRole: "SUPERUSER",  // Add this
        likes: 0,
        dislikes: 0,
        isVisible: true,  // Add this
        isVerified: false  // Add this
    };
    
      console.log("Post Data:", newPost); // Log the data to be sent
  
      try {
        const response = await axios.post("https://techhivebackend-production-86d4.up.railway.app/posts/add", newPost, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
  
        setPosts(prevPosts => [response.data, ...prevPosts]);
        setNewPostContent("");
        setSelectedFile(null);
        setImagePreview(null);
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
    if (!loggedInSuperUser) {
        alert("Please log in to like posts.");
        return;
    }
    try {
        // First handle the post like
        const response = await axios.post(`https://techhivebackend-production-86d4.up.railway.app/posts/${postId}/like`, {}, {
            params: {
                userId: loggedInSuperUser.superuserId,
                userRole: "SUPERUSER"
            }
        });
        const updatedPost = response.data;

        // If this is a report post and there's a userId, update their points with 10 points
        if (updatedPost.userId && updatedPost.isSubmittedReport) {
            try {
                await axios.post(`/api/leaderboard/addPoints`, {}, {
                    params: {
                        userId: updatedPost.userId,
                        points: 10  // Changed to 10 points for report posts
                    }
                });
            } catch (error) {
                console.error("Error updating user points:", error);
            }
        } else if (updatedPost.userId) {
            // Regular post gets 5 points
            try {
                await axios.post(`/api/leaderboard/addPoints`, {}, {
                    params: {
                        userId: updatedPost.userId,
                        points: 5
                    }
                });
            } catch (error) {
                console.error("Error updating user points:", error);
            }
        }

        setPosts(posts.map(post =>
            post.postId === postId ? updatedPost : post
        ));
    } catch (error) {
        console.error("Error liking post:", error);
    }
};


const handleDislike = async (postId) => {
    if (!loggedInSuperUser) {
        alert("Please log in to dislike posts.");
        return;
    }
    try {
        // First handle the post dislike
        const response = await axios.post(`https://techhivebackend-production-86d4.up.railway.app/posts/${postId}/dislike`, {}, {
            params: {
                userId: loggedInSuperUser.superuserId,
                userRole: "SUPERUSER"
            }
        });
        const updatedPost = response.data;

        // If this is a report post and there's a userId, update their points with -10 points
        if (updatedPost.userId && updatedPost.isSubmittedReport) {
            try {
                await axios.post(`/api/leaderboard/subtractPoints`, {}, {
                    params: {
                        userId: updatedPost.userId,
                        points: 10  // Changed to 10 points for report posts
                    }
                });
            } catch (error) {
                console.error("Error updating user points:", error);
            }
        } else if (updatedPost.userId) {
            // Regular post gets -5 points
            try {
                await axios.post(`/api/leaderboard/subtractPoints`, {}, {
                    params: {
                        userId: updatedPost.userId,
                        points: 5
                    }
                });
            } catch (error) {
                console.error("Error updating user points:", error);
            }
        }

        setPosts(posts.map(post =>
            post.postId === postId ? updatedPost : post
        ));
    } catch (error) {
        console.error("Error disliking post:", error);
    }
};

const handleRemoveLike = async (postId, userId, isReport) => {
    try {
        await axios.post(`/api/leaderboard/subtractPoints`, {}, {
            params: {
                userId: userId,
                points: isReport ? 10 : 5
            }
        });
    } catch (error) {
        console.error("Error removing points for like:", error);
    }
};

const handleRemoveDislike = async (postId, userId, isReport) => {
    try {
        await axios.post(`/api/leaderboard/addPoints`, {}, {
            params: {
                userId: userId,
                points: isReport ? 10 : 5
            }
        });
    } catch (error) {
        console.error("Error removing points for dislike:", error);
    }
};

    const handleOpenComments = async (postId) => {
      setCurrentPostId(postId);
      try {
          const [commentsResponse, postResponse] = await Promise.all([
              axios.get(`https://techhivebackend-production-86d4.up.railway.app/comments/${postId}`),
              axios.get(`https://techhivebackend-production-86d4.up.railway.app/posts/${postId}`)
          ]);
          const sortedComments = commentsResponse.data
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .map(comment => ({
                  ...comment,
                  relativeTime: moment(comment.timestamp).fromNow()
              }));
          setComments(sortedComments);
          setCurrentPostOwner(postResponse.data.superuserId);
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
    if (newComment.trim() === '' || !loggedInSuperUser) {
        alert("Please log in to add a comment");
        return;
    }

    // Get the correct ID number
    const idNumber = loggedInSuperUser.superuseridNumber || '21-1047-222';

    const comment = {
        content: newComment,
        postId: currentPostId,
        superUserId: loggedInSuperUser.superuserId,
        fullName: loggedInSuperUser.fullName,
        idNumber: idNumber,  // Use the extracted ID number
        userRole: "SUPERUSER",
        visible: true,
        userId: null,
        adminId: null,
        isDeleted: false
    };

    console.log("Sending comment data:", comment);

    try {
        const response = await axios.post('https://techhivebackend-production-86d4.up.railway.app/comments/add', comment);
        if (response.data) {
            console.log("Comment response:", response.data);
            const processedComment = {
                ...response.data,
                relativeTime: moment(response.data.timestamp).fromNow()
            };
            setComments(prevComments => [processedComment, ...prevComments]);
            setNewComment('');
        }
    } catch (error) {
        console.error("Error adding comment:", error);
        console.error("Error details:", error.response?.data);
        alert("Failed to add comment. Please try again.");
    }
};

const handleDeletePost = (postId) => {
    if (!loggedInSuperUser) {
        alert("Please log in to delete posts.");
        return;
    }
    setItemToDelete(postId); // Set the ID of the post to delete
    setIsDeletePostDialogOpen(true); // Open confirmation dialog
};


// Update the handleDeleteComment function to allow superusers to delete any comment
const handleDeleteComment = (commentId) => {
    if (!loggedInSuperUser) {
        alert("Please log in to delete comments.");
        return;
    }
    
    // SuperUser can delete any comment, so we don't need to check ownership
    setItemToDelete(commentId);
    setIsDeleteCommentDialogOpen(true);
};

    const confirmDeletePost = async () => {
        try {
            await axios.delete(`https://techhivebackend-production-86d4.up.railway.app/posts/${itemToDelete}`);
            // Update frontend to remove the deleted post
            setPosts(posts.filter(post => post.postId !== itemToDelete));
            setIsDeletePostDialogOpen(false);
        } catch (error) {
            console.error("Error deleting post:", error);
        }
    };
    

    const confirmDeleteComment = async () => {
        if (!loggedInSuperUser?.superuserId) {
            alert("Superuser ID is missing. Unable to delete comment.");
            return;
        }

        try {
            // Make the DELETE request to the backend
            await axios.delete(
                `https://techhivebackend-production-86d4.up.railway.app/comments/${itemToDelete}/superuser/${loggedInSuperUser.superuserId}`
            );

            // Update the frontend to reflect the deleted comment
            setComments(comments.filter(comment => comment.commentId !== itemToDelete));
            setIsDeleteCommentDialogOpen(false);
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Failed to delete comment. Please try again.");
        }
    };

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

    const formatTimestamp = (timestamp) => {
        const momentDate = moment(timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
        return momentDate.isValid() 
            ? momentDate.format('dddd, MMMM D, YYYY [at] h:mm A')
            : 'Invalid date';
    };
    
    const getRelativeTime = (timestamp) => {
        const momentDate = moment(timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS');
        return momentDate.isValid() 
            ? momentDate.fromNow()
            : 'Invalid date';
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
        <div className="suhome">
            <SUNavBar />  
            <b className="SUHWildcat">WILDCAT</b>

            <div className="content-wrapper">
                <div className="post-container">
                    <div className="logo-container">
                        <img src={profilePicture || defaultProfile} alt="SuperUser Avatar" className="superusers-dp" />
                    </div>
                    <div className="post-form">
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
                                <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px' }} />
                            </div>
                        )}
                    </div>
                </div>
                <div className="post-list">
                    {posts.map((post) => (
                        <div key={post.postId} className="post-card">
                            <div className="card-container" style={{ position: 'relative' }}>
                           {/* Replace the delete icon section in the name-container with this code */}
<div className="name-container">
    <img src={superuserProfilePictures[post.superUserId] || defaultProfile} alt="SuperUser Avatar" />
    <h5>
        {post.fullName || post.fullname} 
        {post.idNumber || post.idnumber || post.superuseridNumber ? 
            ` (${post.idNumber || post.idnumber || post.superuseridNumber})` : ''}
    </h5>
    {loggedInSuperUser && (
        <img
            src="/delete.png"
            alt="Delete"
            className="delete-icon"
            onClick={() => handleDeletePost(post.postId)}
            style={{ 
                cursor: 'pointer', 
                width: '20px', 
                height: '20px',
                position: 'absolute',
                right: '15px',
                top: '15px'
            }}
        />
    )}
</div>

<div className="timestamp" style={{ marginBottom: '10px', color: '#666' }}>
    <div className="formatted-date" style={{ fontSize: '14px' }}>
        {moment(post.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS').format('dddd, MMMM D, YYYY [at] h:mm A')}
    </div>
    <div className="relative-time" style={{ fontSize: '12px', color: '#888' }}>
        {moment(post.timestamp, 'YYYY-MM-DD HH:mm:ss.SSSSSS').fromNow()}
    </div>
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
                                            className={`like-button ${post.likedBy && post.likedBy.includes(loggedInSuperUser?.superuserId) ? 'active' : ''}`}
                                        >
                                            <img src="/t-up.png" alt="Thumbs Up" /> {post.likes}
                                        </button>
                                        <button 
                                            onClick={() => handleDislike(post.postId)} 
                                            className={`dislike-button ${post.dislikedBy && post.dislikedBy.includes(loggedInSuperUser?.superuserId) ? 'active' : ''}`}
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
                                <div className="superuser-info-container">
                                    <span className="superuser-info">
                                        {comment.fullName} 
                                        {comment.idNumber && ` (${comment.idNumber})`}
                                    </span>
                                    {/* Show delete button for all comments if user is logged in */}
                                    {loggedInSuperUser && (
                                        <img
                                            src="/delete.png"
                                            alt="Delete"
                                            className="delete-icon"
                                            onClick={() => handleDeleteComment(comment.commentId)}
                                        />
                                    )}
                                </div>
                                <div className="timestamp-container">
                                    {comment.timestamp && (
                                        <>
                                            <span className="formatted-time">
                                                {moment(comment.timestamp)
                                                    .utcOffset('+08:00')
                                                    .format('dddd, MMMM D, YYYY [at] h:mm A')}
                                            </span>
                                            <span className="relative-time">
                                                {moment(comment.timestamp).utcOffset('+08:00').fromNow()}
                                            </span>
                                        </>
                                    )}
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
    onClick={() => handleAddComment()} // Changed this line
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

export default SUHome;

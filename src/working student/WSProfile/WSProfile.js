import React, { useState, useCallback, useEffect } from "react";
import axios from "../../services/axiosInstance"; 
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import UpdatedPopUp from './UpdatedPopUp';
import ConfirmLogout from "./ConfirmLogout";
import "./WSProfile.css";
import WSNavBar from '../WSHomepage/WSNavBar';

const WSProfile = ({ className = "" }) => {
  const [isPopUpVisible, setIsPopUpVisible] = useState(false);
  const [isConfirmLogoutVisible, setIsConfirmLogoutVisible] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [isErrorPopUpVisible, setIsErrorPopUpVisible] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [isProfileUpdateSuccessVisible, setIsProfileUpdateSuccessVisible] = useState(false);
  const defaultProfilePicture = 'default.png';
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const fetchLoggedInUser = useCallback(() => {
    const user = JSON.parse(localStorage.getItem("loggedInUser")) || null;
    setLoggedInUser(user);
    return user;
  }, []);

  const fetchProfilePicture = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/api/profile/user/getProfilePicture/${userId}`, {
        responseType: "blob",
      });
      const imageBlob = response.data;
      if (imageBlob.size > 0) {
        const imageUrl = URL.createObjectURL(imageBlob);
        setProfilePicture(imageUrl);
      } else {
        setProfilePicture(defaultProfilePicture);
      }
    } catch (error) {
      console.error("Failed to fetch profile picture:", error.response?.data || error.message);
      setProfilePicture(defaultProfilePicture);
    }
  }, [defaultProfilePicture]);

  const determineBadge = (points) => {
    if (points >= 100) {
      return "/Wildcat-Champion.png"; // Champion badge
    } else if (points >= 80) {
      return "/Wildcat-Prowler.png"; // Prowler badge
    } else {
      return "/Wildcat-Pub.png"; // Cub badge
    }
  };
  
  useEffect(() => {
    const user = fetchLoggedInUser();
    if (user) {
      fetchProfilePicture(user.userId);
    }
  }, [fetchLoggedInUser, fetchProfilePicture]);

  const openLOGOUTConfirmation = () => {
    setIsConfirmLogoutVisible(true);
  };

  const closeLOGOUTConfirmation = () => {
    setIsConfirmLogoutVisible(false);
  };

  const onLOGOUTTextClick = () => {
    navigate("/logged-out");
  };

  const onHomeTextClick = useCallback(() => {
    navigate("/wshomepage");
  }, [navigate]);

  const onReportsTextClick = useCallback(() => {
    navigate("/wsreport");
  }, [navigate]);

  const onLeaderboardsTextClick = useCallback(() => {
    navigate("/wsleaderboards");
  }, [navigate]);

  const onINSIGHTClick = useCallback(() => {
    navigate("/insightanalytics");
  }, [navigate]);

  const openUpdatedPopUp = useCallback(async () => {
    if (!currentPassword || !newPassword) {
      setError("Please enter both current and new passwords.");
      setIsErrorPopUpVisible(true);
      return;
    }
  
    try {
      const userId = loggedInUser.userId;
      const response = await axios.put(`/user/updateUser?userId=${userId}`, {
        currentPassword,
        newPassword,
      });
  
      if (response.status === 200) {
        setIsPopUpVisible(true);
        setCurrentPassword("");
        setNewPassword("");
        setIsEditable(false);
      }
    } catch (error) {
      console.error("Failed to update password:", error.response?.data || error.message);
      setError(error.response?.data || "Failed to update password. Please try again.");
      setIsErrorPopUpVisible(true);
    }
  }, [currentPassword, newPassword, loggedInUser]);
  
  const closeUpdatedPopUp = useCallback(() => {
    setIsPopUpVisible(false);
    setIsEditable(false);
    setCurrentPassword("");
    setNewPassword("");
  }, []);

  const onEditClick = () => {
    setIsEditable(!isEditable);
  };

  const onCancelClick = () => {
    setIsEditable(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleProfilePictureChange = async (event) => {
    const file = event.target.files[0];
    if (file && loggedInUser) {
      const formData = new FormData();
      formData.append("id", loggedInUser.userId);
      formData.append("file", file);
  
      try {
        const response = await axios.post("/api/profile/user/uploadProfilePicture", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
  
        if (response.status === 200) {
          fetchProfilePicture(loggedInUser.userId); // Refresh profile picture
          setIsProfileUpdateSuccessVisible(true);
        }
      } catch (error) {
        console.error("Failed to upload profile picture:", error.response?.data || error.message);
        setError("Failed to upload profile picture. Please try again.");
        setIsErrorPopUpVisible(true);
      }
    }
  };
  
  if (!loggedInUser) {
    return null;
  }

  const badgeUrl = determineBadge(loggedInUser.points); // Define badgeUrl here
  return (
    <div>
      <div className={`ws-profile ${className}`}>
      <WSNavBar />
        <img className="WSProfileBg" alt="" src="/profilebg.png" />
        <div className="ProfilePictureContainer">
          <img className="WSProfileUser" alt="" src={profilePicture || defaultProfilePicture} />
          <label htmlFor="profilePictureUpload" className="WSProfileUserContainer">
            <div className="upload-overlay">
              <span>Upload</span>
            </div>
          </label>

          <input
            type="file"
            onChange={handleProfilePictureChange}
            style={{ display: 'none' }}
            id="profilePictureUpload"
          />

          <img className="WSProfileBadge" alt="User Badge" src={badgeUrl} />
          <div className="WSID">{loggedInUser ? loggedInUser.idNumber : "hi"}</div>
          <div className="WSName">{loggedInUser ? loggedInUser.fullName : "hello"}</div>
          <div className="WSEdu">{loggedInUser ? loggedInUser.email : "Hi"}</div>
          <div className="WSPoints">{loggedInUser ? loggedInUser.points : 0} points</div>

          <div className="WSPLogout">
            <Button
              className="LogoutButton"
              variant="contained"
              sx={{
                borderRadius: "10px",
                width: 110,
                height: 40,
                backgroundColor: "#8A252C",
                "&:hover": {
                  backgroundColor: "#A91D3A",
                  transform: "scale(1.1)",
                  transition: "transform 0.3s ease"
                },
                fontSize: "17px"
              }}
              onClick={openLOGOUTConfirmation}
            >
              Logout
            </Button>
          </div>

          {/* Password section */}
          <div className="PasswordGroup">
            <div className="PasswordBox" />
            <b className="PasswordName">Password</b>
            <div className="OldPass">Current Password</div>
            <div className="NewPass">New Password</div>
          </div>

          <input
            type="password"
            className="OldPassInput"
            disabled={!isEditable}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            type="password"
            className="NewPassInput"
            disabled={!isEditable}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <b className="edit" onClick={onEditClick}>Edit</b>

          <div className="UpdateContainer">
            <Button
              className="UpdateButton"
              variant="contained"
              sx={{
                borderRadius: "10px",
                width: 110,
                height: 35,
                backgroundColor: "#8A252C",
                "&:hover": {
                  backgroundColor: "#AAAAAA",
                  transform: "scale(1.1)",
                  transition: "transform 0.3s ease"
                },
                fontSize: "17px",
                marginRight: "10px",
                marginTop: "-30px"
              }}
              onClick={openUpdatedPopUp}
              disabled={!isEditable}
            >
              Update
            </Button>
            {isEditable && (
              <Button
                className="CancelButton"
                variant="contained"
                sx={{
                  borderRadius: "10px",
                  width: 110,
                  height: 35,
                  backgroundColor: "#8A252C",
                  "&:hover": {
                    backgroundColor: "#AAAAAA",
                    transform: "scale(1.1)",
                    transition: "transform 0.3s ease"
                  },
                  fontSize: "17px"
                }}
                onClick={onCancelClick}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>

        {/* Modals */}
        {isPopUpVisible && (
          <div className="popup-overlay">
            <UpdatedPopUp onClose={closeUpdatedPopUp} />
          </div>
        )}

        {isConfirmLogoutVisible && (
          <div className="popup-overlay">
            <ConfirmLogout
              onLOGOUTTextClick={onLOGOUTTextClick}
              onClose={closeLOGOUTConfirmation}
            />
          </div>
        )}

        {isErrorPopUpVisible && (
          <div className="popup-overlay">
            <ErrorPopUp
              message={error}
              onClose={() => setIsErrorPopUpVisible(false)}
            />
          </div>
        )}

        {isProfileUpdateSuccessVisible && (
          <ProfileUpdateSuccessModal
            onClose={() => setIsProfileUpdateSuccessVisible(false)}
          />
        )}
      </div>
    </div>
  );
};

// ErrorPopUp component
const ErrorPopUp = ({ message, onClose }) => {
  return (
    <div className="error-popup">
      <div className="error-popup-content">
        <p>{message}</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              backgroundColor: '#8a252c',
              color: 'white',
              '&:hover': {
                backgroundColor: '#a91d3a',
                transform: 'scale(1.1)'
              },
              transition: 'transform 0.3s ease'
            }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// ProfileUpdateSuccessModal component
const ProfileUpdateSuccessModal = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="profile-update-success-modal">
        <h2>Success!</h2>
        <p>Your profile picture has been updated successfully.</p>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#8a252c',
            color: '#FFFFFF',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#f9d67b',
              color: '#FFFFFF',
            },
          }}
        >
          OK
        </Button>
      </div>
    </div>
  );
};

export default WSProfile;

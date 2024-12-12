import React, { useState, useEffect } from "react";
import AdNavBar from "../../components/AdNavBar";
import "./AdProfile.css";
import LogoutDialog from "../../components/LogoutDialog";
import EditSuccessfulDialog from "./EditSuccessfulDialog";
import ErrorDialog from "./ErrorDialog";

const AdProfile = () => {
  // Added errorMessage state
  const [isEditable, setIsEditable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // Added this line
  const [admin, setAdmin] = useState({});
  const [profilePicture, setProfilePicture] = useState("/default.png");

  useEffect(() => {
    const loggedInAdmin = JSON.parse(localStorage.getItem('loggedInAdmin'));
    console.log("Logged in admin:", loggedInAdmin);
    if (loggedInAdmin) {
      setAdmin(loggedInAdmin);
      fetch(`https://techhivebackend-production-86d4.up.railway.app/api/profile/admin/getProfilePicture/${loggedInAdmin.adminId}`, {
        credentials: 'include'
      })
        .then(response => response.blob())
        .then(blob => {
          if (blob.size > 0) {
            setProfilePicture(URL.createObjectURL(blob));
          }
        })
        .catch(error => {
          console.error("Error fetching profile picture:", error);
          setErrorMessage("Failed to load profile picture");
          setShowErrorMessage(true);
          setTimeout(() => {
            setShowErrorMessage(false);
            setErrorMessage("");
          }, 3000);
        });
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("id", admin.adminId);

    try {
      const response = await fetch(`https://techhivebackend-production-86d4.up.railway.app/api/profile/admin/uploadProfilePicture`, {
        method: "POST",
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Profile picture updated successfully:", result);
      
      const pictureResponse = await fetch(
        `https://techhivebackend-production-86d4.up.railway.app/api/profile/admin/getProfilePicture/${admin.adminId}`,
        { credentials: 'include' }
      );
      const pictureBlob = await pictureResponse.blob();
      const newProfilePictureUrl = URL.createObjectURL(pictureBlob);
      setProfilePicture(newProfilePictureUrl);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      setErrorMessage("Failed to upload profile picture");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleEditClick = () => {
    setIsEditable(true);
    setCurrentPassword("");
    setNewPassword("");
  };

  const handleUpdateClick = async () => {
    if (!currentPassword || !newPassword) {
      setErrorMessage("Please fill in both password fields");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
      return;
    }
  
    try {
      // First, check if we have the admin object
      if (!admin || !admin.adminId) {
        setErrorMessage("User session not found. Please try logging in again.");
        setShowErrorMessage(true);
        return;
      }
  
      console.log("Sending update request for admin ID:", admin.adminId);
  
      const response = await fetch(`https://techhivebackend-production-86d4.up.railway.app/admin/updatePassword?adminId=${admin.adminId}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });
  
      // Log the response for debugging
      console.log("Response status:", response.status);
      
      const contentType = response.headers.get("content-type");
      let data;
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }
  
      console.log("Response data:", data);
  
      if (!response.ok) {
        throw new Error(typeof data === 'string' ? data : data.message || 'Failed to update password');
      }
  
      setIsEditable(false);
      setShowSuccessMessage(true);
      setCurrentPassword("");
      setNewPassword("");
      
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
  
    } catch (error) {
      console.error("Error updating password:", error);
      setErrorMessage(error.message || "Failed to update password. Please try again.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleCancelClick = () => {
    setIsEditable(false);
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="main-container">
      <header>
        <AdNavBar />
      </header>
      <main className="adprofile-container">
        <div className="profile-container">
          <div className="profile-details">
            <div className="profile-picture-container">
              <img src={profilePicture} alt="Profile" className="profile-picture" />
              <div className="upload-button-container">
                <label className="upload-button">
                  Upload
                  <input 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*"
                    style={{ display: "none" }} 
                  />
                </label>
              </div>
            </div>
            <div className="name-details">
              <span className="id-number">{admin.idNumber}</span>
              <h1>{admin.fullName}</h1>
              <span>{admin.adminname}</span>
            </div>
            <span className="email-design">{admin.email}</span>
            <LogoutDialog />
          </div>
        </div>
        <div className="password-container">
          <h1>Password</h1>
          <form onSubmit={(e) => e.preventDefault()}>
            <div>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                readOnly={!isEditable}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={isEditable ? "Enter current password" : "********"}
              />
            </div>
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                readOnly={!isEditable}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={isEditable ? "Enter new password" : "********"}
              />
            </div>
            <div className="btn-container">
              {isEditable ? (
                <>
                  <button type="button" className="update-btn" onClick={handleUpdateClick}>
                    Update
                  </button>
                  <button type="button" className="cancel-btn" onClick={handleCancelClick}>
                    Cancel
                  </button>
                </>
              ) : (
                <button type="button" className="edit-btn" onClick={handleEditClick}>
                  Edit
                </button>
              )}
            </div>
          </form>
          {showSuccessMessage && <EditSuccessfulDialog />}
          {showErrorMessage && <ErrorDialog message={errorMessage} />}
        </div>
      </main>
    </div>
  );
};

export default AdProfile;
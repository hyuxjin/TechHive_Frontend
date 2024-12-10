import React, { useState, useEffect } from "react";
import SUNavBar from "../../components/SUNavBar";
import "./SUProfile.css";
import LogoutDialog from "../../components/LogoutDialog";
import EditSuccessfulDialog from "./EditSuccessfulDialog";
import ErrorDialog from "./ErrorDialog";

const SUProfile = () => {
  const [isEditable, setIsEditable] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [superuser, setSuperUser] = useState(null);
  const [profilePicture, setProfilePicture] = useState("/default.png");

  useEffect(() => {
    const loggedInSuperUser = localStorage.getItem("loggedInSuperUser");
    console.log("Checking local storage for superuser:", loggedInSuperUser);

    if (loggedInSuperUser) {
      const superuserData = JSON.parse(loggedInSuperUser);
      console.log("Logged in superuser data:", superuserData);

      if (superuserData && superuserData.superuserId) {
        setSuperUser(superuserData);
        fetchProfilePicture(superuserData.superuserId);
      } else {
        setErrorMessage("Invalid user data");
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
          setErrorMessage("");
        }, 3000);
      }
    }
  }, []);

  const fetchProfilePicture = (superuserId) => {
    fetch(`http://localhost:8080/superuser/profile/getProfilePicture/${superuserId}`, {
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch profile picture: ${response.status}`);
        }
        return response.blob();
      })
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
  };

  const handleEditClick = () => {
    setIsEditable(true);
    setCurrentPassword("");
    setNewPassword("");
    setErrorMessage("");
  };

  const handleUpdateClick = () => {
    if (!currentPassword || !newPassword) {
      setErrorMessage("Please fill in both password fields");
      setShowErrorMessage(true);
      setTimeout(() => { setShowErrorMessage(false); }, 3000);
      return;
    }
  
    fetch(`http://localhost:8080/superuser/updateSuperUserPassword?superuserId=${superuser.superuserId}`, {
      method: "PUT",
      credentials: 'include',  // Important for session cookies
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // Include the session ID if you stored it
        "Authorization": `Bearer ${localStorage.getItem("sessionId")}`
      },
      body: JSON.stringify({
        currentSuperUserPassword: currentPassword,
        newSuperUserPassword: newPassword,
      }),
    })
      .then(response => {
        if (response.status === 401) {
          // If session is invalid, redirect to login
          localStorage.removeItem("loggedInSuperUser");
          localStorage.removeItem("sessionId");
          window.location.href = '/sulogin';
          throw new Error("Session expired. Please login again.");
        }
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(text || 'Failed to update password');
          });
        }
        return response.text();
      })
      .then(() => {
        setIsEditable(false);
        setShowSuccessMessage(true);
        setCurrentPassword("");
        setNewPassword("");
        setTimeout(() => { setShowSuccessMessage(false); }, 3000);
      })
      .catch(error => {
        console.error("Error updating password:", error);
        setErrorMessage(error.message);
        setShowErrorMessage(true);
        setTimeout(() => { setShowErrorMessage(false); }, 3000);
      });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);

    if (!file) {
      console.error("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("File size must be less than 2MB");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
      return;
    }

    if (!superuser?.superuserId) {
      setErrorMessage("User session not found. Please login again.");
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
        setErrorMessage("");
      }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("superuserId", superuser.superuserId);
    formData.append("file", file);

    fetch("http://localhost:8080/superuser/profile/uploadProfilePicture", {
      method: "POST",
      credentials: 'include',
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("Profile picture uploaded successfully");
        return fetchProfilePicture(superuser.superuserId);
      })
      .catch(error => {
        console.error("Error uploading profile picture:", error);
        setErrorMessage("Failed to upload profile picture");
        setShowErrorMessage(true);
        setTimeout(() => {
          setShowErrorMessage(false);
          setErrorMessage("");
        }, 3000);
      });
  };

  const handleCancelClick = () => {
    setIsEditable(false);
    setCurrentPassword("");
    setNewPassword("");
    setErrorMessage("");
  };

  return (
    <div className="main-container">
      <header>
        <SUNavBar />
      </header>
      <main className="suprofile-container">
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
              <span className="id-number">{superuser?.superUserIdNumber}</span>
              <h1>{superuser?.fullName}</h1>
              <span>{superuser?.superUsername}</span>
            </div>
            <span className="email-design">{superuser?.email}</span>
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

export default SUProfile;
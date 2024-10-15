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
  const [superuser, setSuperUser] = useState(null); // Initialize as null to avoid undefined issues
  const [profilePicture, setProfilePicture] = useState("/default.png"); // default profile picture

  // Check local storage for user data and initialize state
  useEffect(() => {
    const loggedInSuperUser = localStorage.getItem("loggedInSuperUser");

    if (loggedInSuperUser) {
      const superuserData = JSON.parse(loggedInSuperUser);
      console.log("Logged in superuser data from local storage:", superuserData); // Debugging log

      if (superuserData && superuserData.superuserId) {
        // Set the superuser state
        setSuperUser(superuserData);
        // Fetch the profile picture
        fetchProfilePicture(superuserData.superuserId);
      } else {
        console.error("superuserId is missing in the local storage data.");
      }
    } else {
      console.error("No superuser data found in local storage.");
    }
  }, []); // Only run once on component mount

  // Fetch profile picture from backend
  const fetchProfilePicture = (superuserId) => {
    console.log("Fetching profile picture for SuperUser ID:", superuserId); // Debugging log

    fetch(`http://localhost:8080/superuser/profile/getProfilePicture/${superuserId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch profile picture: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (blob.size > 0) {
          const imageUrl = URL.createObjectURL(blob);
          setProfilePicture(imageUrl); // Set profile picture to the newly created URL
          console.log("Profile picture URL:", imageUrl); // Log the created URL for debugging
        } else {
          console.log("Blob is empty, using default image.");
          setProfilePicture("/default.png"); // Use default image on error
        }
      })
      .catch((error) => {
        console.error("Error fetching profile picture:", error);
        setProfilePicture("/default.png"); // Set default picture on error
      });
  };

  // Handle edit click
  const handleEditClick = () => {
    setIsEditable(true);
    setCurrentPassword("");
    setNewPassword("");
  };

  // Handle password update
  const handleUpdateClick = async () => {
    if (!currentPassword || !newPassword) {
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/superuser/updateSuperUserPassword?superuserId=${superuser.superuserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentSuperUserPassword: currentPassword,
          newSuperUserPassword: newPassword,
        }),
        
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Password updated successfully:", result);

      setIsEditable(false);
      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setShowErrorMessage(true);
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 3000);
    }
  };

  // Handle file change (profile picture upload)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    console.log("Superuser ID for upload:", superuser?.superuserId); // Debug log to ensure superuserId exists

    if (!file) {
      console.error("No file selected for upload.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      console.error("Selected file is not an image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB size limit
      console.error("File size exceeds the 2MB limit.");
      return;
    }

    // Ensure superuserId exists before proceeding
    if (!superuser || !superuser.superuserId) {
      console.error("SuperUser ID is undefined. Cannot upload the file.");
      return;
    }

    const formData = new FormData();
    formData.append("superuserId", superuser.superuserId);
    formData.append("file", file);

    try {
      setProfilePicture("/default.png"); // Reset picture while uploading

      const response = await fetch("http://localhost:8080/superuser/profile/uploadProfilePicture", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Profile picture uploaded successfully.");
      fetchProfilePicture(superuser.superuserId); // Fetch updated profile picture
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
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
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                </label>
              </div>
            </div>
            <div className="name-details">
              <span className="id-number">{superuser?.superuseridNumber}</span>
              <h1>{superuser?.fullName}</h1>
              <span>{superuser?.superusername}</span>
            </div>
            <span className="email-design">{superuser?.email}</span>
            <LogoutDialog />
          </div>
        </div>
        <div className="password-container">
          <h1>Password</h1>
          <form>
            <div>
              <label>Current Password</label>
              <input
                type="password"
                value={currentPassword}
                readOnly={!isEditable}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div>
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                readOnly={!isEditable}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="btn-container">
              {isEditable ? (
                <>
                  <button type="button" className="update-btn" onClick={handleUpdateClick}>
                    Update
                  </button>
                  <button type="button" className="cancel-btn" onClick={() => setIsEditable(false)}>
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
          {showErrorMessage && <ErrorDialog />}
        </div>
      </main>
    </div>
  );
};

export default SUProfile;

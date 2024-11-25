import { useState, useCallback, useEffect } from "react";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import axios from '../../services/axiosInstance'; 

import "./ConfirmLogout.css";

const ConfirmLogout = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const onLOGOUTTextClick = useCallback(async () => {
    try {
      // Call the backend /logout endpoint using the Axios instance
      await axios.post('/user/logout');
      console.log("Logged out successfully");
      navigate("/wslogout"); // Redirect to a logout confirmation or login page
    } catch (error) {
      console.error("Logout failed:", error.response?.data || error.message);
    }
  }, [navigate]);

  const onCANCELTextClick = useCallback(() => {
    console.log("Cancel button clicked");
    if (typeof onClose === 'function') {
      onClose();
    }
    setIsOpen(false);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      // Use a small delay to ensure state update has occurred
      const timer = setTimeout(() => {
        if (typeof onClose === 'function') {
          onClose();
        }
        navigate("/wsprofile");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, navigate]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="logout-popup">
      <div className="logout-popup-content">
        <div className="Confirmation">Are you sure you want to log out?</div>

        <img
          className="ConfirmLogoutIcon"
          alt=""
          src="wildcat-crying.png"
        />

        <div className="LogoutPopUpContainer">
          <Button
            className="LogoutButton"
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: 110,
              height: 35,
              backgroundColor: "#8A252C",
              "&:hover": {
                backgroundColor: "#A91D3A",
                transform: "scale(1.1)",
                transition: "transform 0.3s ease"  // Added for smooth transition
              },
              fontSize: "15px",
              fontWeight: "bold",
              color: "white",
            }}
            onClick={onLOGOUTTextClick}
          >
            LOG OUT
          </Button>
        </div>

        <div className="CancelButtonContainer">
          <Button
            className="LogoutButton"
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: 110,
              height: 35,
              backgroundColor: "#8A252C",
              "&:hover": {
                backgroundColor: "#A91D3A",
                transform: "scale(1.1)",
                transition: "transform 0.3s ease"  // Added for smooth transition
              },
              fontSize: "15px",
              fontWeight: "bold",
              color: "white",
            }}
            onClick={onCANCELTextClick}
          >
            CANCEL
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogout;
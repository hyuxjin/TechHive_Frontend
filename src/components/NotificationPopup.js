import React from "react";
import "./NotificationPopup.css";

const NotificationPopup = ({ message, onClose }) => {
  return (
    <div className="notification-popup">
      <div className="notification-message">{message}</div>
      <button className="notification-close" onClick={onClose}>X</button>
    </div>
  );
};

export default NotificationPopup;

import React from "react";
import "./ConfirmDeletePopup.css";

const ConfirmDeletePopup = ({ onConfirm, onCancel }) => {
  return (
    <div className="confirm-delete-popup">
      <div className="confirm-delete-message">Are you sure you want to delete this post?</div>
      <div className="confirm-delete-buttons">
        <button className="confirm-delete-button" onClick={onConfirm}>Yes</button>
        <button className="confirm-delete-button" onClick={onCancel}>No</button>
      </div>
    </div>
  );
};

export default ConfirmDeletePopup;

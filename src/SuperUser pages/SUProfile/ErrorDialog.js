import React from "react";
import "./ErrorDialog.css";

const ErrorDialog = ({ message }) => {
  return (
    <div className="error-dialog">
      <p>{message || "An error occurred. Please try again."}</p>
    </div>
  );
};

export default ErrorDialog;

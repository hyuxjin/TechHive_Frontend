import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdSignInForm.css";

export default function AdSignInForm() {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showResetPasswordPopup, setShowResetPasswordPopup] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const idNumber = event.target.idNumber.value;
    const password = event.target.password.value;

    try {
      const response = await fetch('http://localhost:8080/admin/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idNumber, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('loggedInAdmin', JSON.stringify({
          adminId: data.adminId,
          adminname: data.adminname,
          fullName: data.fullName,
          email: data.email,
          idNumber: data.idNumber,
          profilePicture: data.profilePicture, // Store the profile picture URL
        }));
        navigate("/adhome");
      } else {
        const message = await response.text();
        alert(`Login failed: ${message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleSendCodeClick = () => {
    setShowForgotPassword(false);
    setShowVerificationPopup(true);
  };

  const handleCloseVerificationPopup = () => {
    setShowVerificationPopup(false);
  };

  const handleVerifyClick = () => {
    setShowVerificationPopup(false);
    setShowResetPasswordPopup(true);
  };

  const handleCloseResetPasswordPopup = () => {
    setShowResetPasswordPopup(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="signin-form">
        <label>
          ID Number <br />
          <input type="text" name="idNumber" required />
        </label>
        <br />
        <label>
          Password <br />
          <input type="password" name="password" required />
        </label>
        <br />
        <button type="submit">SIGN IN</button>
        <br />
        <span 
          className="forgot-password" 
          onClick={handleForgotPasswordClick}>
          Forgot Password?
        </span>
      </form>

      {showForgotPassword && (
        <div className="forgot-password-popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleCloseForgotPassword}>
              &times;
            </button>
            <label>
              <h3>Enter email address</h3>
              <input type="email" name="email" class="form-input" required />
            </label>
            <br />
            <button class="form-button" onClick={handleSendCodeClick}>SEND CODE</button>
          </div>
        </div>
      )}

      {showVerificationPopup && (
        <div className="verification-popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleCloseVerificationPopup}>
              &times;
            </button>
            <label>
            <h3>Enter Verification Code</h3> 
              <input type="text" name="verificationCode" class="form-input" required />
            </label>
            <br />
            <button className="small-button">Resend code</button>
            <br />
            <button class="form-button" onClick={handleVerifyClick}>VERIFY</button>
          </div>
        </div>
      )}

      {showResetPasswordPopup && (
        <div className="reset-password-popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleCloseResetPasswordPopup}>
              &times;
            </button>
            <label>
            <h3>Enter New Password</h3>
              <input type="password" name="newPassword" required />
            </label>
            <br />
            <label>
            <h3>Confirm Password</h3>
              <input type="password" name="confirmPassword" required />
            </label>
            <br />
            <button onClick={handleCloseResetPasswordPopup}>Reset Password</button>
          </div>
        </div>
      )}
    </>
  );
}

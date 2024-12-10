import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdSignInForm.css";

export default function AdSignInForm() {
  const navigate = useNavigate();
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationPopup, setShowVerificationPopup] = useState(false);
  const [showResetPasswordPopup, setShowResetPasswordPopup] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "success" or "error"

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const showModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setTimeout(() => setModalMessage(""), 3000); // Auto-hide modal
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/admin/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idNumber, password }),
      });

     // In AdSignInForm.js, modify the login success handler
if (response.ok) {
  const data = await response.json();
  localStorage.setItem("adminToken", data.token);
  localStorage.setItem("loggedInAdmin", JSON.stringify({
    adminId: data.adminId,
    adminname: data.adminname,
    fullname: data.fullName,  // Make sure this matches the backend property name
    idnumber: data.idNumber,  // Make sure this matches the backend property name
    email: data.email,
    profilePicture: data.profilePicture
  }));
  navigate("/adhome");
} else {
        const message = await response.text();
        showModal(`Login failed: ${message}`, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showModal("An error occurred. Please try again.", "error");
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
    setEmail("");
  };

  const handleSendCode = async () => {
    try {
        if (!email || !email.trim()) {
            showModal("Email address is required", "error");
            return;
        }

        const response = await fetch("http://localhost:8080/admin/requestPasswordReset", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email.trim() }),
        });

        const data = await response.text();

        if (response.ok) {
            setShowForgotPassword(false);
            setShowVerificationPopup(true);
            setCountdown(30);
            showModal("Reset code sent to your email", "success");
        } else if (response.status === 404) {
            showModal("No account found with this email address", "error");
        } else {
            showModal(data || "Failed to send reset code", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showModal("An error occurred while sending the reset code", "error");
    }
};


  const handleResendCode = async () => {
    if (countdown === 0) {
      await handleSendCode();
    }
  };

  const handleVerifyCode = async () => {
    try {
        if (!verificationCode || !verificationCode.trim()) {
            showModal("Verification code is required", "error");
            return;
        }

        const response = await fetch("http://localhost:8080/admin/verifyResetCode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                email: email.trim(),
                resetCode: verificationCode.trim()
            }),
        });

        const data = await response.text();

        if (response.ok) {
            setShowVerificationPopup(false);
            setShowResetPasswordPopup(true);
            showModal("Code verified successfully", "success");
        } else if (response.status === 400) {
            showModal("Invalid or expired verification code", "error");
        } else {
            showModal(data || "Verification failed", "error");
        }
    } catch (error) {
        console.error("Error:", error);
        showModal("An error occurred during verification", "error");
    }
};

const handleResetPassword = async () => {
  try {
      if (!newPassword || !confirmPassword) {
          showModal("Both password fields are required", "error");
          return;
      }

      if (newPassword !== confirmPassword) {
          showModal("Passwords do not match", "error");
          return;
      }

      if (newPassword.length < 6) {
          showModal("Password must be at least 6 characters long", "error");
          return;
      }

      const response = await fetch("http://localhost:8080/admin/resetPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
              email: email.trim(),
              newPassword: newPassword
          }),
      });

      const data = await response.text();

      if (response.ok) {
          setShowResetPasswordPopup(false);
          setEmail("");
          setNewPassword("");
          setConfirmPassword("");
          setVerificationCode("");
          showModal("Password reset successfully!", "success");
      } else {
          showModal(data || "Failed to reset password", "error");
      }
  } catch (error) {
      console.error("Error:", error);
      showModal("An error occurred while resetting the password", "error");
  }
};

  return (
    <>
      <form onSubmit={handleSubmit} className="signin-form">
        <label>
          ID Number <br />
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Password <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">SIGN IN</button>
        <br />
        <span className="adforgot-password" onClick={handleForgotPasswordClick}>
          Forgot Password?
        </span>
      </form>

      {showForgotPassword && (
  <div className="adforgot-password-popup">
    <div className="adpopup-content">
      <button className="adclose-button" onClick={handleCloseForgotPassword}>
        &times;
      </button>
      <h2>Forgot Password</h2>
      <label className="email-label">
        <span>Enter email address</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="Enter your email"
        />
      </label>
      <button className="adsendcode" onClick={handleSendCode}>Send Code</button>
    </div>
  </div>
)}

{showVerificationPopup && (
    <div className="verification-popup">
        <div className="adpopup-content">
            <h2>Enter Verification Code</h2>
            <p>Please enter the code sent to your email</p>
            <label>
                Verification Code
                <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    required
                />
            </label>
            <br />
            <button 
                className={`resend-code ${countdown > 0 ? 'disabled' : ''}`}
                onClick={handleResendCode} 
                disabled={countdown > 0}
            >
                Resend Code {countdown > 0 && `(${countdown}s)`}
            </button>
            <br />
            <button onClick={handleVerifyCode}>Verify</button>
        </div>
    </div>
)}

      {showResetPasswordPopup && (
        <div className="reset-password-popup">
          <div className="popup-content">
            <label>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <br />
            <label>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <br />
            <button onClick={handleResetPassword}>Reset Password</button>
          </div>
        </div>
      )}

      {modalMessage && (
        <div className={`modal ${modalType}`}>
          <p>{modalMessage}</p>
        </div>
      )}
    </>
  );
}

import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import "./SignIn.css";

const SignIn = () => {
  const navigate = useNavigate();
  const [idNumberValue, setIdNumberValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [resetStep, setResetStep] = useState(0);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");

  // New state variables for modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState(""); // "error" or "success"

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
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalMessage("");
    setModalType("");
  };

  // Updated safe stringify to avoid circular reference issue and deep nesting
  const safeStringify = (obj, space = 2) => {
    const cache = new WeakSet();
    const maxDepth = 5;  // Prevents deeply nested objects

    const deepClone = (obj, depth = 0) => {
      if (depth > maxDepth) return "[Object too deep]";
      if (!obj) return obj; // Handle null/undefined
      if (typeof obj === 'object') {
        if (cache.has(obj)) return "[Circular]";
        cache.add(obj);
  
        const copy = Array.isArray(obj) ? [] : {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            // Skip functions and undefined values
            if (typeof obj[key] !== 'function' && obj[key] !== undefined) {
              copy[key] = deepClone(obj[key], depth + 1);
            }
          }
        }
        return copy;
      }
      return obj;
    };

    try {
      const safeObject = deepClone(obj);
      return JSON.stringify(safeObject, null, space);
    } catch (error) {
      console.error('Error stringifying user data:', error);
      // Return a minimal safe version
      return JSON.stringify({
        userId: obj.userId,
        username: obj.username,
        fullName: obj.fullName,
        idNumber: obj.idNumber,
        role: obj.role || 'USER',
        userRole: obj.role || 'USER'
      });
    }
  };

  const onSignInButtonClick = useCallback(async () => {
    try {
      const response = await axios.post("/user/login", {
        idNumber: idNumberValue,
        password: passwordValue,
      });
  
      if (response.status === 200) {
        const user = {
          ...response.data,
          // Ensure userRole is set either from role or default to STUDENT
          userRole: response.data.role || 'USER'
        };
  
        // Log the user object to verify data
        console.log("User data before storage:", user);
  
        // Store in localStorage with the safe stringify
        localStorage.setItem("loggedInUser", safeStringify(user));
  
        showModal("Sign-in successful!", "success");
        setTimeout(() => {
          closeModal();
          navigate("/wshomepage", { state: { loggedInUser: user } });
        }, 2000);
      }
    } catch (error) {
      console.error("Sign-in Error:", error);
      showModal("Invalid ID number or password. Please try again.", "error");
    }
  }, [navigate, idNumberValue, passwordValue]);

  const handleIdNumberChange = (event) => {
    setIdNumberValue(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPasswordValue(event.target.value);
  };

  const onSIGNUPSIGNINClick = useCallback(() => {
    navigate("/wssignupsignin");
  }, [navigate]);

  const onSIGNUPClick = useCallback(() => {
    navigate("/signup");
  }, [navigate]);

  const handleForgotPasswordClick = useCallback(() => {
    setResetStep(1);
    setMessage("");
  }, []);

  const handleSendCode = useCallback(async () => {
    try {
      await axios.post("/user/requestPasswordReset", { email: resetEmail });
      showModal("Reset code has been sent to your email.", "success");
      setResetStep(2);
      setCountdown(30);
    } catch (error) {
      console.error("Error sending reset code:", error);
      showModal("Failed to send reset code. Please try again.", "error");
    }
  }, [resetEmail]);

  const handleResendCode = useCallback(async () => {
    if (countdown === 0) {
      try {
        await axios.post("/requestPasswordReset", { email: resetEmail });
        setCountdown(30);
        showModal("Reset code has been resent to your email.", "success");
      } catch (error) {
        console.error("Error resending reset code:", error);
        showModal("Failed to resend reset code. Please try again.", "error");
      }
    }
  }, [countdown, resetEmail]);

  const handleVerifyCode = useCallback(async () => {
    try {
      const response = await axios.post("/user/verifyResetCode", null, {
        params: {
          email: resetEmail,
          resetCode: resetCode,
        },
      });

      if (response.status === 200) {
        showModal("Verification successful! Please enter your new password.", "success");
        setResetStep(3);
      } else {
        showModal("Invalid verification code.", "error");
      }
    } catch (error) {
      console.error("Error verifying reset code:", error);
      showModal("Failed to verify reset code. Please try again.", "error");
    }
  }, [resetCode, resetEmail]);

  const handleResetPassword = useCallback(async () => {
    if (newPassword !== confirmPassword) {
      showModal("Passwords do not match.", "error");
      return;
    }

    try {
      await axios.post("/user/resetPassword", {
        email: resetEmail,
        newPassword: newPassword,
        confirmPassword: confirmPassword,
      });
      showModal("Password reset successfully!", "success");
      setResetStep(4);
    } catch (error) {
      console.error("Error resetting password:", error);
      showModal("Failed to reset password. Please try again.", "error");
    }
  }, [resetEmail, newPassword, confirmPassword]);

  const handleGoBack = useCallback(() => {
    setResetStep(0);
    setResetEmail("");
    setResetCode("");
    setNewPassword("");
    setConfirmPassword("");
    setCountdown(0);
    setMessage("");
  }, []);

  const handleResetBack = useCallback(() => {
    if (resetStep > 1) {
      setResetStep(resetStep - 1);
    } else {
      handleGoBack();
    }
  }, [resetStep, handleGoBack]);

  return (
    <div className="ws-sign-in">
      <img className="background" alt="" src="/bg1.png" />
      <div className="main-boxSI" />
      <div className="back-button-container" onClick={onSIGNUPSIGNINClick}>
        <div className="back-bgSI" />
        <img className="back-iconSI" alt="Back" src="/back.png" />
      </div>
      <img className="main-bgSI" alt="" src="/main-bg.png" />
      <img className="main-titleSI" alt="" src="/TITLE.png" />
      <i className="welcomeSI">WELCOME!</i>
      <i className="sub-title2">Sign in to your Account</i>
      <div className="id-number-in">ID Number</div>
      <input
        className="id-number-b"
        type="text"
        value={idNumberValue}
        onChange={handleIdNumberChange}
      />
      <div className="P-name">Password</div>
      <input
        className="P-box"
        type="password"
        value={passwordValue}
        onChange={handlePasswordChange}
      />
      <div className="forgot-password" onClick={handleForgotPasswordClick}>
        Forgot Password?
      </div>
      <div className="SIContainer" onClick={onSignInButtonClick}>
        <div className="SIButton" />
        <div className="SIName">SIGN IN</div>
      </div>
      <div className="q4">Don't have an account?</div>
      <div className="q5" onClick={onSIGNUPClick}>
        Sign Up
      </div>

      {resetStep > 0 && (
        <div className="password-reset-overlay">
          {message && <div className="message">{message}</div>}
          {resetStep === 1 && (
            <div className="password-reset-step">
              <div className="reset-back-button" onClick={handleResetBack}>
                <div className="reset-back-bg" />
                <img className="reset-back-icon" alt="Back" src="/back.png" />
              </div>
              <h2>Enter email address</h2>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <button onClick={handleSendCode}>SEND CODE</button>
            </div>
          )}
          {resetStep === 2 && (
            <div className="password-reset-step">
              <div className="reset-back-button" onClick={handleResetBack}>
                <div className="reset-back-bg" />
                <img className="reset-back-icon" alt="Back" src="/back.png" />
              </div>
              <h2>Enter verification code</h2>
              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
              />
              <button onClick={handleVerifyCode}>VERIFY</button>
              <div className="resend-code-container">
                <span
                  className={`resend-code ${countdown > 0 ? 'disabled' : ''}`}
                  onClick={handleResendCode}
                >
                  Resend code
                </span>
                {countdown > 0 && <span className="countdown"> ({countdown}s)</span>}
              </div>
            </div>
          )}
          {resetStep === 3 && (
            <div className="password-reset-step">
              <div className="reset-back-button" onClick={handleResetBack}>
                <div className="reset-back-bg" />
                <img className="reset-back-icon" alt="Back" src="/back.png" />
              </div>
              <h2>Reset your password</h2>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handleResetPassword}>RESET PASSWORD</button>
            </div>
          )}
          {resetStep === 4 && (
            <div className="password-reset-step">
              <h2>Password reset successful!</h2>
              <button onClick={handleGoBack}>GO BACK</button>
            </div>
          )}
        </div>
      )}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className={`modal-content ${modalType}`}>
            <p>{modalMessage}</p>
            <button className="modal-ok" onClick={closeModal}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignIn;

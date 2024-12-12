import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SUSignInForm.css";

export default function SUSignInForm() {
    const navigate = useNavigate();
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

    const [idNumber, setIdNumber] = useState("");
    const [password, setPassword] = useState("");

    // Countdown effect for resend code timer
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    // Modal display handler
    const showModal = (message, type) => {
        setModalMessage(message);
        setModalType(type);
        setTimeout(() => setModalMessage(""), 3000); // Auto-hide modal after 3 seconds
    };

    // Forgot Password handler
    const handleForgotPasswordClick = () => {
        setShowForgotPassword(true);
    };

    const handleCloseForgotPassword = () => {
        setShowForgotPassword(false);
        setEmail("");
    };

    // Send reset code
    const handleSendCode = async () => {
        try {
            const response = await fetch('https://techhivebackend-production-86d4.up.railway.app/superuser/requestPasswordReset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.text();
            
            if (response.ok) {
                setShowForgotPassword(false);
                setShowVerificationPopup(true);
                setCountdown(30);
                showModal("Reset code sent to your email.", "success");
            } else {
                showModal(data || "Failed to send reset code", "error");
            }
        } catch (error) {
            console.error("Error sending reset code:", error);
            showModal("An error occurred while sending the reset code.", "error");
        }
    };

    // Resend code handler
    const handleResendCode = async () => {
        if (countdown === 0) {
            await handleSendCode();
        }
    };

    // Verify reset code
    const handleVerifyCode = async () => {
        try {
            const response = await fetch('https://techhivebackend-production-86d4.up.railway.app/superuser/validateResetCode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, resetCode: verificationCode }),
            });
    
            const data = await response.text();
    
            if (response.ok) {
                setShowVerificationPopup(false);
                setShowResetPasswordPopup(true);
                showModal("Code verified. Enter your new password.", "success");
            } else {
                showModal(data || "Verification failed", "error");
            }
        } catch (error) {
            console.error("Error verifying code:", error);
            showModal("An error occurred during verification.", "error");
        }
    };

    // Reset password
    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) {
            showModal("Passwords do not match.", "error");
            return;
        }
        try {
            const response = await fetch('https://techhivebackend-production-86d4.up.railway.app/superuser/resetPassword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword }),
            });
    
            const data = await response.text();
    
            if (response.ok) {
                setShowResetPasswordPopup(false);
                setEmail("");
                setNewPassword("");
                setConfirmPassword("");
                showModal("Password reset successfully!", "success");
            } else {
                showModal(data || "Failed to reset password", "error");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            showModal("An error occurred while resetting the password.", "error");
        }
    };

    // Sign-in handler
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const response = await fetch("https://techhivebackend-production-86d4.up.railway.app/superuser/signin", {
            method: "POST",
            credentials: 'include',  // Important for session cookies
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            body: JSON.stringify({ 
              superUserIdNumber: idNumber,
              superUserPassword: password 
            }),
          });
      
          if (response.ok) {
            const data = await response.json();
            // Store both the user data and the session information
            localStorage.setItem("loggedInSuperUser", JSON.stringify(data));
            localStorage.setItem("sessionId", data.sessionId);
            navigate("/suhome");
          } else {
            const message = await response.text();
            showModal(`Login failed: ${message}`, "error");
          }
        } catch (error) {
          console.error("Error:", error);
          showModal("An error occurred. Please try again.", "error");
        }
      };

    return (
        <>
            <form onSubmit={handleSubmit} className="SUsignin-form">
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
                <button type="button" onClick={handleForgotPasswordClick} className="suforgot-password">
                    Forgot Password?
                </button>
                <br />
                <button type="submit">SIGN IN</button>
            </form>

            {showForgotPassword && (
                <div className="suforgot-password-popup">
                    <div className="supopup-content">
                        <button className="suclose-button" onClick={handleCloseForgotPassword}>
                            &times;
                        </button>
                        <h2>Forgot Password</h2>
                        <label>
                            Enter email address
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </label>
                        <br />
                        <button className="susendcode" onClick={handleSendCode}>Send Code</button>
                    </div>
                </div>
            )}

            {showVerificationPopup && (
                <div className="verification-popup">
                    <div className="supopup-content">
                        <h2>Enter Verification Code</h2>
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
                            className={`resend-code ${countdown > 0 ? "disabled" : ""}`}
                            onClick={handleResendCode}
                        >
                            Resend Code
                        </button>
                        {countdown > 0 && <span className="countdown"> ({countdown}s)</span>}
                        <br />
                        <button onClick={handleVerifyCode}>Verify</button>
                    </div>
                </div>
            )}

{showResetPasswordPopup && (
    <div className="reset-password-popup">
        <div className="popup-content">
            <h2>Enter New Password</h2>
            <div className="password-input-group">
                <label>
                    New Password
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </label>
                <label>
                    Confirm Password
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                </label>
            </div>
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

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SUSignInForm.css";

export default function SUSignInForm() {
    const navigate = useNavigate();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showVerificationPopup, setShowVerificationPopup] = useState(false);
    const [showResetPasswordPopup, setShowResetPasswordPopup] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const superuseridNumber = event.target.superuseridNumber.value;
        const superuserpassword = event.target.superuserpassword.value;

        try {
            const response = await fetch('http://localhost:8080/superuser/signin', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    superUserIdNumber: superuseridNumber, // Correct case for backend
                    superUserPassword: superuserpassword, // Correct case for backend
                }),
            });

            console.log('Response:', response); // Debugging: check the raw response

            if (response.ok) {
                const data = await response.json();
                console.log('Data:', data); // Debugging: check the parsed data

                // Store the correct user data in local storage
                localStorage.setItem('superuserToken', data.token);
                localStorage.setItem('loggedInSuperUser', JSON.stringify({
                    superuserId: data.superuserId, // Consistent lowercase 'superuserId'
                    superusername: data.superusername,
                    fullName: data.fullName,
                    email: data.email,
                    superuseridNumber: data.superUserIdNumber, // Correct key reference
                    profilePicture: data.profilePicture || null, // Added null fallback in case profilePicture is missing
                }));

                // Navigate to the super user home page after login
                navigate("/SUhome");
            } else {
                const message = await response.text();
                console.log('Login failed:', message); // Debugging: log the failure message
                alert(`Login failed: ${message}`);
            }
        } catch (error) {
            console.error('Error during login:', error); // Debugging: log any errors
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
            <form onSubmit={handleSubmit} className="SUsignin-form">
                <label>
                    ID Number <br />
                    <input type="text" name="superuseridNumber" required />
                </label>
                <br />
                <label>
                    Password <br />
                    <input type="password" name="superuserpassword" required />
                </label>
                <button type="button" onClick={handleForgotPasswordClick} className="forgot-password">
                    Forgot Password?
                </button>
                <br />
                <button type="submit">SIGN IN</button>
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
                        <button class="form-button" onClick={handleSendCodeClick}>Send Code</button>
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
                        <button className="small-button">Resend Code</button>
                        <br />
                        <button class="form-button" onClick={handleVerifyClick}>Verify</button>
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

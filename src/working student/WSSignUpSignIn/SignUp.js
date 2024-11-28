import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../services/axiosInstance";
import "./SignUp.css";

const SignUp = () => {
  const navigate = useNavigate();
  const [fullNameValue, setFullNameValue] = useState("");
  const [emailValue, setEmailValue] = useState("");
  const [usernameValue, setUsernameValue] = useState("");
  const [idNumberValue, setIdNumberValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [confirmPasswordValue, setConfirmPasswordValue] = useState("");
  const [idError, setIdError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const openModal = (message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  };

  const closeModal = async () => {
    setIsModalOpen(false);
    if (isEmailVerified && !isVerificationModalOpen) {
      try {
        const response = await axios.post("/user/insertUser", {
          fullName: fullNameValue,
          email: emailValue,
          username: usernameValue,
          idNumber: idNumberValue,
          password: passwordValue,
          isAdmin: false,
        });

        if (response.status === 200) {
          navigate("/successfullyregistered");
        }
      } catch (error) {
        console.error("Signup Error:", error);
        setTimeout(() => {
          openModal("An error occurred during sign up. Please try again.");
        }, 100);
      }
    }
  };

  const openConfirmationModal = () => {
    setIsConfirmationModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsConfirmationModalOpen(false);
  };

  const handleSendCode = useCallback(async () => {
    try {
      await axios.post("/user/sendVerificationEmail", {
        email: emailValue,
        fullName: fullNameValue,
      });
      setIsVerificationModalOpen(true);
      setCountdown(30);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send verification code.";
      openModal(errorMsg);
    }
  }, [emailValue, fullNameValue]);

  const handleResendCode = useCallback(async () => {
    if (countdown === 0) {
      try {
        await axios.post("/user/sendVerificationEmail", {
          email: emailValue,
          fullName: fullNameValue,
        });
        setCountdown(30);
        openModal("Email Verification Code has been resent to your email.");
      } catch (error) {
        console.error("Error resending verification code:", error);
        openModal("Failed to resend verification code. Please try again.");
      }
    }
  }, [countdown, emailValue, fullNameValue]);

  const handleVerifyCode = useCallback(async () => {
    try {
      const response = await axios.post("/user/verifyCode", {
        email: emailValue,
        code: verificationCode,
      });

      if (response.status === 200) {
        setIsEmailVerified(true);
        setIsVerificationModalOpen(false);
        setTimeout(() => {
          openModal("Email verified successfully! Please proceed with sign up.");
        }, 100);
      }
    } catch (error) {
      console.error("Error verifying code:", error);

      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.response?.status === 400 && error.response?.data === "Invalid or expired code.") {
        errorMessage = "Verification code is invalid or has expired. Please request a new code.";
      }

      setModalMessage(errorMessage);
      setIsModalOpen(true);
    }
  }, [verificationCode, emailValue]);

  const shakeInput = (selector) => {
    const inputElement = document.querySelector(selector);
    if (inputElement) {
      inputElement.classList.add("input-error");
      setTimeout(() => inputElement.classList.remove("input-error"), 300);
    }
  };

  const onSignUpButtonClick = async () => {
    setIdError("");
    setEmailError("");

    if (!fullNameValue.trim()) {
      shakeInput(".full-name-box");
      return;
    }

    const emailRegex = /^[a-zA-Z]+\.[a-zA-Z]+@cit\.edu$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError("Use a valid @cit.edu email address.");
      shakeInput(".email-box");
      return;
    }

    if (!usernameValue.trim()) {
      shakeInput(".username-box");
      return;
    }

    const idPattern = /^[0-9]{2}-[0-9]{4}-[0-9]{3}$/;
    if (!idPattern.test(idNumberValue)) {
      setIdError("ID number format should be YY-NNNN-NNN.");
      shakeInput(".id-number-box");
      return;
    }

    if (passwordValue !== confirmPasswordValue) {
      openModal("Password and confirm password do not match.");
      shakeInput(".pass-box");
      shakeInput(".cpass-box");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(passwordValue)) {
      openModal(
        "Password must have at least 8 characters, including uppercase, lowercase, a number, and a special character."
      );
      shakeInput(".pass-box");
      return;
    }

    if (!isEmailVerified) {
      await handleSendCode();
      return;
    }

    openConfirmationModal();
  };

  const handleConfirmSignUp = async () => {
    closeConfirmationModal();

    try {
      const response = await axios.post("/user/insertUser", {
        fullName: fullNameValue,
        email: emailValue,
        username: usernameValue,
        idNumber: idNumberValue,
        password: passwordValue,
        isAdmin: false,
      });

      if (response.status === 200) {
        navigate("/successfullyregistered");
      }
    } catch (error) {
      console.error("Signup Error:", error);
      openModal("An error occurred during sign up. Please try again.");
    }
  };

  const handleFullNameChange = (event) => {
    setFullNameValue(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmailValue(event.target.value);
  };

  const handleUsernameChange = (event) => {
    setUsernameValue(event.target.value);
  };

  const handleIdNumberChange = (event) => {
    const value = event.target.value;
    const idPattern = /^[0-9]{2}-[0-9]{4}-[0-9]{3}$/;

    if (idPattern.test(value)) {
      setIdError("");
    } else {
      setIdError("ID Number format should be YY-NNNN-NNN");
    }

    setIdNumberValue(value);
  };

  const handlePasswordChange = (event) => {
    setPasswordValue(event.target.value);
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPasswordValue(event.target.value);
  };

  const onSIGNINClick = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  const onSIGNUPSIGNINClick = useCallback(() => {
    navigate("/wssignupsignin");
  }, [navigate]);

  return (
    <div className="ws-sign-up">
      <img className="background" alt="" src="/bg1.png" />
      <div className="main-boxSU" />
      <div className="back-button-container" onClick={onSIGNUPSIGNINClick}>
        <div className="back-bgSU" />
        <img className="back-iconSU" alt="Back" src="/back.png" />
      </div>

      <img className="main-bgSU" alt="" src="/main-bg.png" />
      <img className="main-titleSU" alt="" src="/TITLE.png" />

      <i className="welcome2">WELCOME!</i>
      <i className="sub-title">Create your Account</i>

      <div className="full-name">Full Name</div>
      <input
        className="full-name-box"
        type="text"
        value={fullNameValue}
        onChange={handleFullNameChange}
      />

      <div className="email-name">Email</div>
      <input
        className={`email-box ${emailError ? "input-error" : ""}`}
        type="email"
        value={emailValue}
        onChange={handleEmailChange}
      />
      {emailError && <p className="error-message">{emailError}</p>}

      <div className="username-name">Username</div>
      <input
        className="username-box"
        type="text"
        value={usernameValue}
        onChange={handleUsernameChange}
      />

      <div className="id-number-name">ID Number</div>
      <input
        className={`id-number-box ${idError ? "input-error" : ""}`}
        type="text"
        value={idNumberValue}
        onChange={handleIdNumberChange}
      />
      {idError && <p className="error-message">{idError}</p>}

      <div className="pass-name">Password</div>
      <input
        className="pass-box"
        type="password"
        value={passwordValue}
        onChange={handlePasswordChange}
      />

      <div className="cpass-name">Confirm Password</div>
      <input
        className="cpass-box"
        type="password"
        value={confirmPasswordValue}
        onChange={handleConfirmPasswordChange}
      />

      <div className="signupContainer" onClick={onSignUpButtonClick}>
        <div className="s-button" />
        <div className="s-name">SIGN UP</div>
      </div>

      <div className="q1">Already have an account?</div>
      <div className="q2" onClick={onSIGNINClick}>
        Sign In
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button className="modal-ok" onClick={closeModal}>
              OK
            </button>
          </div>
        </div>
      )}

      {isConfirmationModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>Are you sure you want to sign up?</p>
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={handleConfirmSignUp}>
                YES
              </button>
              <button className="modal-cancel" onClick={closeConfirmationModal}>
                NO
              </button>
            </div>
          </div>
        </div>
      )}

      {isVerificationModalOpen && (
        <div className="email-verification-overlay">
          <div className="email-verification-step">
            <h2>Email Verification Code</h2>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter code"
            />
            <button onClick={handleVerifyCode}>VERIFY</button>
            <div className="resend-code-container">
              {countdown > 0 ? (
                <span className="countdown">Resend in {countdown}s</span>
              ) : (
                <span className="resend-code" onClick={handleResendCode}>
                  Resend Code
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;

import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./SuccessfullyRegistered.css";

const SuccessfullyRegistered = () => {
  const navigate = useNavigate();

  const onSIGNINClick = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  return (
    <div className="successfully-register">
      <img className="background" alt="" src="/bg1.png" />

      <div className="main-boxSR" />
      <img className="main-bg" alt="" src="/main-bg.png" />
      <img className="main-title" alt="" src="/TITLE.png" />

      <div className="messContainer">
        <p className="m">You have</p>
        <p className="m">successfully registered!</p>
        <p className="m">&nbsp;</p>
        <p className="m">Click the button below</p>
        <p className="m">to proceed.</p>
      </div>

      <div className="signinContainer" onClick={onSIGNINClick}>
        <div className="si-button" />
        <div className="si-name">SIGN IN</div>
      </div>
    </div>
  );
};

export default SuccessfullyRegistered;

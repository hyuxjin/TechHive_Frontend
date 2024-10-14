import React from "react";
import { useNavigate } from 'react-router-dom';
import "./Logout.css";
import WildText from "../../assets/image/TITLE.png";
import CatRunning from "../../assets/image/CatRunning.png";

const AdLogout = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/adsignin');
  };

  return (
    <div className="bg-main">
      <div className="logout-container">
        <div className="wildcat-container">
          <div className="wildtap-container">
            <img src={WildText} alt="title" />
          </div>
        </div>
        <div className="return-container">
          <img src={CatRunning} alt="Cat Running" />
          <h1>Wildcat on the prowl!</h1>
          <button onClick={handleReturnHome}>RETURN HOME</button>
        </div>
      </div>
    </div>
  );
};

export default AdLogout;

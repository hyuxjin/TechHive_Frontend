import React from "react";
import "./LeaderboardNameContainer.css";
import WildChampion from "../assets/image/Wildcat-Champion.png";

const LeaderboardNameContainer = () => {
  return (
    <div className="ldname-container">
      <div className="ld-icon">
        <img src={WildChampion} alt="wildchamp" />
      </div>
      <div className="ld-names">
        <div className="ld-name-container ">
          <h1 className="ld-name">Dawn Marie Gumagay</h1>
          <h2 className="ld-score">4000</h2>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardNameContainer;

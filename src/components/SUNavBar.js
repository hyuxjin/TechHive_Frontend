import { useState, useEffect } from "react";
import TapIcon from "../assets/image/TITLE.png";
import "./SUNavBar.css";
import { GiHamburgerMenu } from "react-icons/gi";

const SUNavBar = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className={`navbar ${showNavbar ? "active" : ""}`}>
      <div className="logo">
        <img src={TapIcon} alt="Title logo" />
      </div>
      <div className="date-time">
        {dateTime}
      </div>
      <div className={`nav-elements ${showNavbar ? "active" : ""}`}>
        <ul>
          <li>
            <a href="/suhome">Home</a>
          </li>
          <li>
            <a href="/suleaderboard">Leaderboard</a>
          </li>
          <li>
            <a href="/suinsight">Insight</a>
          </li>
          <li>
            <a href="/sudirectory">Directory</a>
          </li>
          <li>
            <a href="/suprofile">Profile</a>
          </li>
        </ul>
      </div>
      <div className="menu-icon" onClick={handleShowNavbar}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default SUNavBar;

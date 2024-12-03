import { useState, useEffect } from "react";
import TapIcon from "../assets/image/TITLE.png";
import "./AdNavbar.css";
import { GiHamburgerMenu } from "react-icons/gi";

const AdNavBar = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());
  const [selected, setSelected] = useState(window.location.pathname); // Set default to current path

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const handleNavClick = (path) => {
    setSelected(path); // Update selected state
  };

  useEffect(() => {
    // Update date and time every second
    const intervalId = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);

    // Sync selected path with current URL on component mount
    setSelected(window.location.pathname);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <nav className={`adnavbar ${showNavbar ? "active" : ""}`}>
      <div className="logo">
        <img src={TapIcon} alt="Title logo" />
      </div>
      <div className="date-time">
        {dateTime}
      </div>
      <div className={`nav-elements ${showNavbar ? "active" : ""}`}>
        <ul>
          <li>
            <a
              href="/adhome"
              onClick={() => handleNavClick("/adhome")}
              className={selected === "/adhome" ? "active" : ""}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/adentry"
              onClick={() => handleNavClick("/adentry")}
              className={selected === "/adentry" ? "active" : ""}
            >
              Report
            </a>
          </li>
          <li>
            <a
              href="/adleaderboard"
              onClick={() => handleNavClick("/adleaderboard")}
              className={selected === "/adleaderboard" ? "active" : ""}
            >
              Leaderboard
            </a>
          </li>
          <li>
            <a
              href="/adinsight"
              onClick={() => handleNavClick("/adinsight")}
              className={selected === "/adinsight" ? "active" : ""}
            >
              Insight
            </a>
          </li>
          <li>
            <a
              href="/adprofile"
              onClick={() => handleNavClick("/adprofile")}
              className={selected === "/adprofile" ? "active" : ""}
            >
              Profile
            </a>
          </li>
        </ul>
      </div>
      <div className="menu-icon" onClick={handleShowNavbar}>
        <GiHamburgerMenu />
      </div>
    </nav>
  );
};

export default AdNavBar;

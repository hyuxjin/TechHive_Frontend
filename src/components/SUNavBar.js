import { useState, useEffect } from "react";
import TapIcon from "../assets/image/TITLE.png";
import "./SUNavBar.css";
import { GiHamburgerMenu } from "react-icons/gi";

const SUNavBar = () => {
  const [showNavbar, setShowNavbar] = useState(false);
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());
  const [selected, setSelected] = useState(window.location.pathname); // Set default selected to current path

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const handleNavClick = (path) => {
    setSelected(path); // Update selected state
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);

    // Sync selected path with current URL on component mount
    setSelected(window.location.pathname);

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
            <a
              href="/suhome"
              onClick={() => handleNavClick("/suhome")}
              className={selected === "/suhome" ? "active" : ""}
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/suleaderboard"
              onClick={() => handleNavClick("/suleaderboard")}
              className={selected === "/suleaderboard" ? "active" : ""}
            >
              Leaderboard
            </a>
          </li>
          <li>
            <a
              href="/suinsight"
              onClick={() => handleNavClick("/suinsight")}
              className={selected === "/suinsight" ? "active" : ""}
            >
              Insight
            </a>
          </li>
          <li>
            <a
              href="/sudirectory"
              onClick={() => handleNavClick("/sudirectory")}
              className={selected === "/sudirectory" ? "active" : ""}
            >
              Directory
            </a>
          </li>
          <li>
            <a
              href="/suprofile"
              onClick={() => handleNavClick("/suprofile")}
              className={selected === "/suprofile" ? "active" : ""}
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

export default SUNavBar;

import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import Loadable from 'react-loadable';
import "./WSReport.css";

const PopUpReportFinal = Loadable({
  loader: () => import('./PopUpReportFinal'),
  loading: () => <div>Loading...</div>,
});

const WSReport = () => {
  const navigate = useNavigate();
  const [isPopupVisible, setPopupVisible] = useState(false);

  const togglePopup = useCallback(() => {
    setPopupVisible(prev => !prev);
  }, []);

  const closePopup = useCallback(() => {
    setPopupVisible(false);
  }, []);


  const onHomeTextClick = useCallback(() => {
    navigate("/wshomepage");
  }, [navigate]);

  const onLEADERBOARDSClick = useCallback(() => {
    navigate("/wsleaderboards");
  }, [navigate]);

  const onINSIGHTClick = useCallback(() => {
    navigate("/insightanalytics");
  }, [navigate]);

  const onPROFILEClick = useCallback(() => {
    navigate("/wsprofile");
  }, [navigate]);

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="ws-report">
        <img className="bg2-expanded" alt="" src="/bg2-expanded.png" />

        <div className="WSNavbar">
          <img className="WSTitle" alt="" src="/TITLE.png" />
          <div className="nav-links">
            <div className="NHome" onClick={onHomeTextClick}>
              Home
            </div>
            <b className="NReports">Report</b>
            <div className="NLeaderboards" onClick={onLEADERBOARDSClick}>
              Leaderboard
            </div>
            <div className="NInsight" onClick={onINSIGHTClick}>
              Insight
            </div>
            <div className="NProfile" onClick={onPROFILEClick}>
              Profile
            </div>
          </div>
          {/* Toggle Navigation Button for mobile */}
          <button className="nav-toggle" onClick={() => setIsOpen(!isOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="nav-toggle-icon">
              <path fillRule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
            </svg>
          </button>
          {/* Mobile Dropdown Menu */}
          {isOpen && (
            <div className="mobile-menu">
              <div className="mobile-menu-links">
                <div className="NHome-mobile" onClick={onHomeTextClick}>
                  Home
                </div>
                <b className="NReports-mobile">Report</b>
                <div className="NLeaderboards-mobile" onClick={onLEADERBOARDSClick}>
                  Leaderboard
                </div>
                <div className="NInsight-mobile" onClick={onINSIGHTClick}>
                  Insight
                </div>
                <div className="NProfile-mobile" onClick={onPROFILEClick}>
                  Profile
                </div>
              </div>
            </div>
          )}
        </div>

        <img className="IncidentReport-Pic" alt="" src="/IN.png" />

        <b className="INTitle1">{`See something? Say something. `}</b>
        <b className="INTitle2">Report here!</b>
        <img
          className="INReport"
          alt=""
          src="/wildcat-icon.png"
          onClick={togglePopup}
        />
      </div>

      {isPopupVisible && (
        <div className="overlay" onClick={closePopup}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <PopUpReportFinal onClose={closePopup} />
          </div>
        </div>
      )}
    </>
  );
};

export default WSReport;

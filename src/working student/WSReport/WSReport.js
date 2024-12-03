import React, { useCallback, useState } from "react";
import Loadable from 'react-loadable';
import "./WSReport.css";
import WSNavBar from '../WSHomepage/WSNavBar'; // Adjust the path as needed

const PopUpReportFinal = Loadable({
  loader: () => import('./PopUpReportFinal'),
  loading: () => <div>Loading...</div>,
});

const WSReport = () => {
  const [isPopupVisible, setPopupVisible] = useState(false);

  const togglePopup = useCallback(() => {
    setPopupVisible(prev => !prev);
  }, []);

  const closePopup = useCallback(() => {
    setPopupVisible(false);
  }, []);

  return (
    <>
      <div className="ws-report">
        <img className="bg2-expanded" alt="" src="/bg2-expanded.png" />
        <WSNavBar />

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

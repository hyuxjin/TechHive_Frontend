import React, { useState } from "react";
import reportsTitle from '../../assets/image/reportsTitle.png'; // Ensure correct path to reportsTitle.png
import AdNavBar from '../../components/AdNavBar'; // Ensure correct path to AdNavBar
import './AdEntry.css';

// Placeholder images
const CitLogo = "https://via.placeholder.com/50";
const ExampleImage = "https://via.placeholder.com/100";
const FlagIcon = process.env.PUBLIC_URL + "/flag.png"; // Flag icon from the public folder
const BackIcon = process.env.PUBLIC_URL + "/back.png"; // Back button icon from the public folder

export default function AdEntry() {
  const [incomingReports, setIncomingReports] = useState([
    {
      id: 1,
      name: "Richard Molina",
      category: "Critical Emergency",
      location: "NGE Building",
      description: "A 45-year-old male was brought to the emergency department...",
      image: ExampleImage,
      date: new Date().toLocaleDateString(),
      status: 'pending', // Maroon light active initially
      isFlagged: false
    },
    {
      id: 2,
      name: "Jessica Santos",
      category: "Urgent Situation",
      location: "Main Hall",
      description: "An urgent request for maintenance...",
      image: ExampleImage,
      date: new Date().toLocaleDateString(),
      status: 'pending', // Maroon light active initially
      isFlagged: false
    }
  ]);

  const [flaggedReports, setFlaggedReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // Function to toggle flag status of a report
  const toggleFlag = (reportId) => {
    setIncomingReports((prevReports) => {
      return prevReports.map((report) => {
        if (report.id === reportId) {
          const updatedFlaggedStatus = !report.isFlagged;
          if (updatedFlaggedStatus) {
            setFlaggedReports((prevFlagged) => [...prevFlagged, report]);
          } else {
            setFlaggedReports((prevFlagged) => prevFlagged.filter((r) => r.id !== reportId));
          }
          return { ...report, isFlagged: updatedFlaggedStatus };
        }
        return report;
      });
    });
  };

  // Function to handle report click and change traffic light to gray (acknowledged) only if still pending
  const handleReportClick = (report) => {
    if (report.status === 'pending') {
      setIncomingReports((prevReports) =>
        prevReports.map((r) =>
          r.id === report.id ? { ...r, status: 'acknowledged' } : r
        )
      );
      setSelectedReport({ ...report, status: 'acknowledged' }); // Open the pop-up modal with updated status
    } else {
      setSelectedReport(report); // Open the pop-up with the existing status
    }
  };

  // Function to close the report modal
  const closeReportModal = () => {
    setSelectedReport(null);
  };

  // Function to update the traffic light status inside the pop-up
  const updateTrafficLight = (newStatus) => {
    setIncomingReports((prevReports) =>
      prevReports.map((r) =>
        r.id === selectedReport.id ? { ...r, status: newStatus } : r
      )
    );
    setFlaggedReports((prevFlagged) =>
      prevFlagged.map((r) =>
        r.id === selectedReport.id ? { ...r, status: newStatus } : r
      )
    );
    setSelectedReport((prevSelectedReport) => ({
      ...prevSelectedReport,
      status: newStatus,
    }));
  };

  // Render traffic lights for non-clickable in report card (smaller traffic lights)
  const renderTrafficLightsNonClickable = (report) => (
    <div className="traffic-lights">
      <div className={`traffic-circle maroon ${report.status === 'pending' ? 'active' : ''}`} />
      <div className={`traffic-circle gray ${report.status === 'acknowledged' ? 'active' : ''}`} />
      <div className={`traffic-circle yellow ${report.status === 'ongoing' ? 'active' : ''}`} />
      <div className={`traffic-circle green ${report.status === 'resolved' ? 'active' : ''}`} />
    </div>
  );

  // Render traffic lights for clickable inside the pop-up (full-size traffic lights)
  const renderTrafficLightsClickable = (report) => (
    <div className="traffic-lights">
      <div className={`traffic-circle maroon ${report.status === 'pending' ? 'active' : ''}`} />
      <div className={`traffic-circle gray ${report.status === 'acknowledged' ? 'active' : ''}`} />
      <div
        className={`traffic-circle yellow ${report.status === 'ongoing' ? 'active' : ''}`}
        onClick={() => updateTrafficLight('ongoing')}
      />
      <div
        className={`traffic-circle green ${report.status === 'resolved' ? 'active' : ''}`}
        onClick={() => updateTrafficLight('resolved')}
      />
    </div>
  );

  const renderReportCard = (report) => (
    <div key={report.id} className="entrypost-card report-container"> {/* Added report-container class */}
      <div className="card-header">
        {renderTrafficLightsNonClickable(report)}
        <div
          className="flag-icon"
          onClick={() => toggleFlag(report.id)}
        >
          <img src={FlagIcon} alt="Flag Report" />
        </div>
      </div>

      {/* Updated profile picture and name layout */}
      <div className="collapsed-details" onClick={() => handleReportClick(report)}>
        <div className="entry-profile-container"> {/* New container for profile picture and name */}
          <img src={CitLogo} alt="Cit Logo" className="profile-picture" />
          <h5 className="profile-name">{report.name}</h5>
        </div>
        <div className="entry-details">
          <h5>Date: <span>{report.date}</span></h5>
          <h5>Location: <span>{report.location}</span></h5>
        </div>
      </div>
    </div>
  );

  return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <main className="entrysub-container">
        <img src={reportsTitle} alt="Incoming Reports" className="report-header-image" />

        {/* Flagged Reports Section */}
        <section className="flagged-reports-section">
          <h3>Flagged Reports</h3>
          {flaggedReports.length > 0 ? (
            flaggedReports.map((report) => renderReportCard(report))
          ) : (
            <p>No flagged reports.</p>
          )}
        </section>

        {/* Incoming Reports Section */}
        <section className="incoming-reports-section">
          <h3>Incoming Reports</h3>
          {incomingReports
            .filter((report) => !report.isFlagged)
            .map((report) => renderReportCard(report))}
        </section>
      </main>

      {/* Pop-up Modal for report details */}
      {selectedReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            {/* Back button with back.png icon */}
            <div className="modal-header">
              <button className="back-button" onClick={closeReportModal}>
                <img src={BackIcon} alt="Back" className="back-button-icon" />
              </button>

              {/* Traffic lights and flag icon with adjusted spacing */}
              <div className="traffic-lights-and-flag">
                {renderTrafficLightsClickable(selectedReport)}
                <div
                  className="flag-icon-modal"
                  onClick={() => toggleFlag(selectedReport.id)}
                >
                  <img src={FlagIcon} alt="Flag Report" />
                </div>
              </div>
            </div>

            <h2>{selectedReport.name}</h2>
            <p><strong>Date:</strong> {selectedReport.date}</p>
            <p><strong>Location:</strong> {selectedReport.location}</p>
            <p><strong>Category:</strong> {selectedReport.category}</p>
            <p>{selectedReport.description}</p>

            {/* Add three image placeholders */}
            <div className="modal-image-container">
              <img src={selectedReport.image} alt="Report Image 1" className="modal-image-small" />
              <img src={selectedReport.image} alt="Report Image 2" className="modal-image-small" />
              <img src={selectedReport.image} alt="Report Image 3" className="modal-image-small" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

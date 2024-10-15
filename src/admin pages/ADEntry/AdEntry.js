import React, { useState, useEffect } from "react";
import AdNavBar from '../../components/AdNavBar'; // Ensure correct path to AdNavBar
import reportsTitle from '../../assets/image/reportsTitle.png'; // Ensure correct path to reportsTitle.png
import './AdEntry.css';

// Placeholder images
const CitLogo = "https://via.placeholder.com/50";
const ExampleImage = "https://via.placeholder.com/100";

export default function AdEntry() {
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDenyClicked, setIsDenyClicked] = useState(false);
  const [offices, setOffices] = useState([]); // State to store enabled offices
  const [selectedOffice, setSelectedOffice] = useState(''); // State for selected office

  const handleOpenRespondModal = () => {
    setIsRespondModalOpen(true);
  };

  const handleCloseRespondModal = () => {
    setIsRespondModalOpen(false);
    setIsDenyClicked(false); // Reset deny state when modal closes
  };

  const handleOpenEditCategoryModal = () => {
    setIsEditCategoryModalOpen(true);
  };

  const handleCloseEditCategoryModal = () => {
    setIsEditCategoryModalOpen(false);
  };

  useEffect(() => {
    // Fetch enabled offices from the backend
    fetch("http://localhost:8080/office/getOfficesByStatus?status=true")
      .then(response => response.json())
      .then(data => setOffices(data))
      .catch(error => console.error("Error fetching offices:", error));
  }, []);

  return (
    <div className="entrymain-container">
      <header>
        <AdNavBar />
      </header>
      <main className="entrysub-container">
        <img src={reportsTitle} alt="Incoming Reports" className="report-header-image" />
        <div className="entrypost-card">
          <div className="entrycard-container">
            <div className="entryname-container">
              <img src={CitLogo} alt="Cit Logo" className="logo" />
              <h5>Richard Molina</h5>
            </div>
            <div className="entry-details">
              <h5>
                Category: <span>Critical Emergency</span>
              </h5>
              <h5>
                Incident Location: <span>NGE Building</span>
              </h5>
              <h5>
                Office: <span>Clinic Office</span>
              </h5>
            </div>
            <div className="image-description-container">
              <img src={ExampleImage} alt="Example" className="square-image" />
              <p className="description-text">
                A 45-year-old male was brought to the emergency department by ambulance after collapsing at work. He was
                found unresponsive by coworkers, who immediately called 911.
              </p>
            </div>
            <div className="entryfooter-line" />
            <div className="footer-actions">
              <div className="button-container">
                <button className="respond-button" onClick={handleOpenRespondModal}>
                  Respond
                </button>
                <button className="edit-button" onClick={handleOpenEditCategoryModal}>
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Respond Modal */}
        {isRespondModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2 className="modal-title">Approval Decision</h2>
              <div className="button-group">
                <button className="approve-button" onClick={handleCloseRespondModal}>
                  Approve
                </button>
                <button className="deny-button" onClick={() => setIsDenyClicked(true)}>
                  Deny
                </button>
              </div>
              {isDenyClicked && (
                <div className="form-group">
                  <label>Please state the reason for denial:</label>
                  <textarea
                    placeholder="Reason for denial"
                    className="readonly-textarea"
                  />
                </div>
              )}
              <button className="submit-button" onClick={handleCloseRespondModal}>
                Submit
              </button>
              <button className="modal-back-button" onClick={handleCloseRespondModal}>
                Back
              </button>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {isEditCategoryModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="modal-close-button" onClick={handleCloseEditCategoryModal}>
                Back
              </button>
              <h2 className="modal-title">Category</h2>
              <div className="radio-group">
                <label>
                  <input type="radio" name="category" value="critical" />
                  Critical Emergency
                </label>
                <label>
                  <input type="radio" name="category" value="urgent" />
                  Urgent Situation
                </label>
                <label>
                  <input type="radio" name="category" value="general" />
                  General Report
                </label>
              </div>
              <div className="form-group">
                <label>Incident Location:</label>
                <input type="text" value="NGE Building" readOnly className="readonly-input" />
              </div>
              <div className="form-group">
                <label>Office:</label>
                <select
                  className="dropdown"
                  value={selectedOffice}
                  onChange={(e) => setSelectedOffice(e.target.value)}
                >
                  {offices.length > 0 ? (
                    offices.map((office) => (
                      <option key={office.id} value={office.name}>
                        {office.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No enabled offices available</option>
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Description:</label>
                <textarea
                  value="A 45-year-old male is brought to the emergency department by ambulance after collapsing at work."
                  readOnly
                  className="readonly-textarea"
                />
              </div>
              <button className="confirm-button" onClick={handleCloseEditCategoryModal}>
                Confirm
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import "./AdReportContainer.css";
import CitLogo from "../assets/image/CitLogo.png";
import ExampleImage from "../assets/image/ex.png";

function RespondModal({ onClose }) {
  const [isDenyClicked, setIsDenyClicked] = useState(false);
  const [reason, setReason] = useState("");

  const handleApprove = () => {
    onClose(); // Close the modal after approval
  };

  const handleDeny = () => {
    setIsDenyClicked(true); // Show the reason textarea when Deny is clicked
  };

  const handleSubmit = () => {
    console.log("Reason:", reason); // Log the reason for deny
    onClose(); // Close the modal after submission
  };

  return (
    <div className="modal-overlay show"> {/* Adding class 'show' for dimming */}
      <div className="modal-content">
        <h2>Approval Decision</h2>
        <div className="button-group">
          <button className="approve-button" onClick={handleApprove}>
            Approve
          </button>
          <button className="deny-button" onClick={handleDeny}>
            Deny
          </button>
        </div>
        {isDenyClicked && (
          <div className="form-group">
            <label>Please state the reason for denial:</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason for denial"
              className="reason-textarea"
            />
          </div>
        )}
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
        <button className="modal-back-button" onClick={onClose}>
          Back
        </button>
      </div>
    </div>
  );
}

function EditCategoryModal({ onClose }) {
  const [offices, setOffices] = useState([]); // State to store enabled offices

  useEffect(() => {
    // Fetch the enabled offices from the backend
    fetch("http://localhost:8080/office/getOfficesByStatus?status=true")
      .then((response) => response.json())
      .then((data) => setOffices(data))
      .catch((error) => console.error("Error fetching offices:", error));
  }, []);

  return (
    <div className="modal-overlay show"> {/* Adding class 'show' for dimming */}
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>
          Back
        </button>
        <h2>Category</h2>
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
          <input
            type="text"
            value="NGE Building"
            readOnly
            className="readonly-input"
          />
        </div>
        <div className="form-group">
          <label>Office:</label>
          <select className="dropdown">
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
            value="A 45-year-old male is brought to the emergency department by ambulance after collapsing at work. He was found unresponsive by coworkers, who immediately called 911."
            readOnly
            className="readonly-textarea"
          />
        </div>
        <button className="confirm-button" onClick={onClose}>
          Confirm
        </button>
      </div>
    </div>
  );
}

export default function AdReportContainer() {
  const [isRespondModalOpen, setIsRespondModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);

  const handleOpenRespondModal = () => setIsRespondModalOpen(true);
  const handleCloseRespondModal = () => setIsRespondModalOpen(false);

  const handleOpenEditCategoryModal = () => setIsEditCategoryModalOpen(true);
  const handleCloseEditCategoryModal = () => setIsEditCategoryModalOpen(false);

  return (
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
            A 45-year-old male was brought to the emergency department by
            ambulance after collapsing at work. He was found unresponsive by
            coworkers, who immediately called 911.
          </p>
        </div>
        <div className="entryfooter-line" />
        <div className="footer-actions">
          <div className="button-container">
            <button
              className="respond-button"
              onClick={handleOpenRespondModal}
            >
              Respond
            </button>
            <button className="edit-button" onClick={handleOpenEditCategoryModal}>
              Edit
            </button>
          </div>
        </div>
      </div>
      {isRespondModalOpen && <RespondModal onClose={handleCloseRespondModal} />}
      {isEditCategoryModalOpen && <EditCategoryModal onClose={handleCloseEditCategoryModal} />}
    </div>
  );
}

import React from "react";
import "./EditCategoryModal.css";

export default function EditCategoryModal({ onClose, offices }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
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
        <button className="modal-back-button" onClick={onClose}>
          Back
        </button> {/* Positioned inside the modal content */}
      </div>
    </div>
  );
}

import React from 'react';
import PropTypes from 'prop-types';

const UpdatedPopUp = ({ onClose }) => {
  return (
    <div className="popup">
      <h2>Popup Title</h2>
      <p>Popup Content</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

UpdatedPopUp.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default UpdatedPopUp;

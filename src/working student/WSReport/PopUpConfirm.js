import React, { useCallback, useState } from "react";
import { Button } from "@mui/material";
import "./PopUpConfirm.css";


const PopUpConfirm = ({ onClose, onSubmit }) => {
  const [isSuccessVisible, setSuccessVisible] = useState(false); // Track success popup visibility

  // Handle the Confirm button click
  const handleConfirm = useCallback(() => {
    if (onSubmit) {
      onSubmit(); 
    }
    setSuccessVisible(true); 
  }, [onSubmit]);

  return (
    <>
      {!isSuccessVisible && (
        <>
          <div className="overlay" /> {/* Overlay */}
          <div className="pop-up-confirm">
            <div className="PUConfirm" />
            <div className="PUQuestion">
              Are you sure you want to confirm the report?
            </div>
            <img className="PUConfirmPic" alt="Confirmation Icon" src="/wreport-icon.png" />
            <Button
              className="PUCReportButton"
              variant="contained"
              sx={{
                borderRadius: "10px",
                width: 115,
                height: 40,
                backgroundColor: "#8A252C",
                "&:hover": { backgroundColor: "#A91D3A" }
              }}
              onClick={handleConfirm} // Call handleConfirm on click
            >
              CONFIRM
            </Button>
            <Button
              className="PUCCancelButton"
              variant="contained"
              sx={{
                borderRadius: "10px",
                width: 115,
                height: 40,
                backgroundColor: "#8A252C",
                "&:hover": { backgroundColor: "#A91D3A" }
              }}
              onClick={onClose} // Handle cancel click
            >
              CANCEL
            </Button>
          </div>
        </>
      )}

    
    </>
  );
};

export default PopUpConfirm;
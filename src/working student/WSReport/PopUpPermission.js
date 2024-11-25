import { useCallback } from "react";
import { Button } from "@mui/material";
import "./PopUpPermission.css";

const PopUpPermission = (onClose) => {

  const handleCancel = useCallback(() => {
    console.log("Cancel button clicked"); // Add this line for debugging
    onClose();
  }, [onClose]);

  return (
    <div className="PermissionPage">
      <div className="allow-access">
        Please allow access to your camera
      </div>

      <Button
        className="permission-cancel-button"
        variant="contained"
        sx={{
          borderRadius: "10px",
          width: 115,
          height: 40,
          backgroundColor: "#8A252C",
          "&:hover": { backgroundColor: "#A91D3A" }
        }}
        onClick={handleCancel} // Changed to handleCancel
      >
        CANCEL
      </Button>

      <Button
        className="permission-allow-button"
        variant="contained"
        sx={{
          borderRadius: "10px",
          width: 115,
          height: 40,
          backgroundColor: "#8A252C",
          "&:hover": { backgroundColor: "#A91D3A" }
        }}
      >
        ALLOW
      </Button>

      <img className="permission-camera" alt="" src="/rpcam.png" />
    </div>
  );
};

export default PopUpPermission;

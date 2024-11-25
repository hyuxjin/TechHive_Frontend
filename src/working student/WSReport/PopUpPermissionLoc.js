import { useCallback, useState } from "react";
import { Button } from "@mui/material";
import PopUpReportFinal from "./PopUpReportFinal"; // Import PopUpReportFinal component
import "./PopUpPermissionLoc.css";

const PopUpPermissionLoc = () => { 
  const [showFinalPopup, setShowFinalPopup] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);

  const handleDeny = useCallback(() => {
    console.log("Deny button clicked");
    setShowPermissionPopup(false);
    setLocationDenied(true);
    setShowFinalPopup(true);
  }, []);

  const handleAllow = useCallback(() => {
    console.log("Allow button clicked");
    setShowPermissionPopup(false);
    setLocationDenied(false);
    setShowFinalPopup(true);
  }, []);

  const handleLocationRetry = useCallback(() => {
    console.log("Retrying location access");
    setShowPermissionPopup(true);
    setShowFinalPopup(false);
    setLocationDenied(false);
  }, []);


  return (
    <div className="overlay">
      {showPermissionPopup && (
        <div className="PermissionPage2">
          <div className="allow-location">
            Allow location access to report incidents accurately in your area
          </div>

          <Button
            className="permission-deny-button2"
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: 115,
              height: 40,
              backgroundColor: "#8A252C",
              "&:hover": { backgroundColor: "#A91D3A" }
            }}
            onClick={handleDeny}
          >
            DENY
          </Button>

          
          <Button
            className="permission-allow-button2"
            variant="contained"
            sx={{
              borderRadius: "10px",
              width: 115,
              height: 40,
              backgroundColor: "#8A252C",
              "&:hover": { backgroundColor: "#A91D3A" }
            }}
            onClick={handleAllow}
          >
            ALLOW
          </Button>

          <img className="permission-location" alt="Location" src="/location2.png" />
        </div>
      )}

      {showFinalPopup && (
          <PopUpReportFinal 
            locationDenied={locationDenied} 
            onLocationRetry={handleLocationRetry}
          />
        )}
    </div>
  );
};

export default PopUpPermissionLoc;
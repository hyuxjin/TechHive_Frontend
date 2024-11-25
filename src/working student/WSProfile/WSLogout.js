import { useCallback } from "react";
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import "./WSLogout.css";

const WSLogout = () => {
  const navigate = useNavigate();

  const onGroupContainerClick = useCallback(() => {
    navigate("/signin");
  }, [navigate]);

  return (
    <div className="logged-out">
      <img className="background" alt="" src="/bg1.png" />

      <div className="main-boxL" />
      <img className="main-bg" alt="" src="/main-bg.png" />
      <img className="main-title" alt="" src="/TITLE.png" />

      <img
        className="wildcatbye"
        alt=""
        src="/wildcat-bye.png"
      />

      <div className="OnProwl">Wildcat on the prowl!</div>

      <div className="ReturnHomeContainer">
      <Button
        className="ReturnHomeButton"
        variant="contained"
        sx={{
          borderRadius: "30px",
          width: '100%',
          height: 40,
          backgroundColor: "#8A252C",
          "&:hover": { 
            backgroundColor: "#A91D3A",
            transform: "scale(1.1)"  // Add this line for the scale effect
          },
          transition: "transform 0.3s ease",  // Add this line for smooth transition
          fontSize: {
            xs: '14px', // for extra-small devices (mobile)
            sm: '16px'  // for small devices and up
          },
          fontWeight: "500"
        }}
        onClick={onGroupContainerClick}
      >
        RETURN HOME
      </Button>
    </div>
      
    </div>
  );
};

export default WSLogout;
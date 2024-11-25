import { useCallback } from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./WSLandingPage.css";

const WSLandingPage = () => {
  const navigate = useNavigate();


  const onABOUTUSTextClick = useCallback(() => {
    navigate("/wsaboutus");
  }, [navigate]);

  const onCONTACTUSTextClick = useCallback(() => {
    navigate("/wscontactus");
  }, [navigate]);

  const onGroupButtonClick = useCallback(() => {
    navigate("/wssignupsignin");
  }, [navigate]);

  return (
    <div className="ws-landing-page">
      <img className="background" alt="" src="/bg1.png" />
      
      <div className="main-box" />
      <img className="wildcat-cute" alt="" src="/wildcat-icon.png" />
      <div className="contact-us-name" onClick={onCONTACTUSTextClick}>
        CONTACT US
      </div>
      <div className="half2">|</div>
      <div className="about-us-name" onClick={onABOUTUSTextClick}>
        ABOUT US
      </div>

      <img className="title-icon" alt="" src="/TITLE.png" />
      <Button
        className="get-started-button"
        variant="contained"
        sx={{
          borderRadius: "10px",
          width: 165,
          height: 40,
          backgroundColor: "#8A252C",
          transition: "all 0.3s ease",
          "&:hover, &:active": {
            backgroundColor: "#A91D3A",
            transform: "scale(1.05)",
          },
          "@media (max-width: 500px)": {
            width: 140,
            height: 36,
          }
        }}
        onClick={onGroupButtonClick}
      >
        <span style={{ fontSize: "15px" }}>GET STARTED</span>
      </Button>


      <div className="badge-container">
        <img
          className="badge1"
          alt=""
          src="/Wildcat-Champion.png"
        />
        <img
          className="badge2"
          alt=""
          src="/Wildcat-Prowler.png"
        />
        <img
          className="badge3"
          alt=""
          src="/Wildcat-Pub.png"
        />
      

        <div className="app-info">
          A platform for the technologian community to submit incident reports and
          discuss various topics beyond CIT-U issues, promoting efficient
          problem-solving and broad community engagement.
        </div>
        
        <div className="badge1-bar" />
        <div className="badge2-bar" />
        <div className="badge3-bar" />
        <div className="line-div" />
      </div>
      
    </div>
  );
};

export default WSLandingPage;

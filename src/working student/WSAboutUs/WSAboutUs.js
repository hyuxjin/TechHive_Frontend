import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./WSAboutUs.css";

const WSAboutUs = () => {
  const navigate = useNavigate();

  const onGETSTARTEDTextClick = useCallback(() => {
    navigate("/wslandingpage");
  }, [navigate]);

  const onCONTACTUSTextClick = useCallback(() => {
    navigate("/wscontactus");
  }, [navigate]);

  const onLeftClick = useCallback(() => {
    navigate("/wsaboutus5");
  }, [navigate]);

  const onRightClick = useCallback(() => {
    navigate("/wsaboutus2");
  }, [navigate]);

  return (
    <div className="ws-about-us">
      <img className="background" alt="" src="/bg1.png" />

      <div className="main-box" />
      <img className="wildcat-cuteAU" alt="" src="/wildcat-icon.png" />
      <div className="get-started2" onClick={onGETSTARTEDTextClick}>
        GET STARTED
      </div>
      <div className="half3">|</div>
      <div className="contact-us2" onClick={onCONTACTUSTextClick}>
        CONTACT US
      </div>

      <div className="AboutUs-title">ABOUT US</div>
      <b className="member-name">Richard Molina</b>

      <div className="role-name">Role</div>
      <div className="role-info">UI/UX Designer, Developer</div>
      <div className="role-bg" />
      <img className="role-icon" alt="" src="/role.png" />

      <div className="motto-name">Motto</div>
      <div className="motto-info">Leadership helps others find their hidden strengths.</div>
      <div className="motto-bg" />
      <img className="motto-icon" alt="" src="/motto.png" />

      <div className="hobbies-name">Hobbies</div>
      <div className="hobbies-info">Watching Movies</div>
      <div className="hobbies-bg" />
      <img className="hobbies-icon" alt="" src="/hobby.png" />
      
      <img className="members-dp" alt="" src="/m-dp.png" />
      <img className="left-click" alt="" src="/left.png" onClick={onLeftClick} />
      <img className="right-click" alt="" src="/right.png" onClick={onRightClick} />
    </div>
  );
};

export default WSAboutUs;

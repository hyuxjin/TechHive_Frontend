import { useCallback } from "react";
import "./WSComment.css";

const WSComment = ({ onClose }) => { 
    const onEllipseClick = useCallback(() => {
      onClose(); 
    }, [onClose]);
  return (
    <div className="ws-comment">
      <div className="Comment-box" />
      <div className="Comment-exit" onClick={onEllipseClick} />
      <b className="x" onClick={onEllipseClick}  >x </b>
      
      <div className="Comment1-Container">
        <div className="CUser1">richard.molina</div>
        <img
          className="CUser1-badge"
          alt=""
          src="/Wildcat-Prowler.png"
        />
        <div className="CUser1-text">Is this true?</div>
      </div>


      <div className="Comment2-Container">
        <div className="CUser1">richard.molina</div>
        <img
          className="CUser1-badge"
          alt=""
          src="/Wildcat-Prowler.png"
        />
        <div className="CUser2-text">This report is true!</div>
      </div>
      
      <div className="Comment3-Container">
        <div className="CUser1">richard.molina</div>
        <img
          className="CUser1-badge"
          alt=""
          src="/Wildcat-Prowler.png"
        />
        <div className="CUser3-text">I saw it happened!</div>
      </div>
    </div>
  );
};

export default WSComment;

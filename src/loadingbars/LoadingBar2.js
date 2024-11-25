import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import './LoadingBar2.css';

const LoadingBar2 = () => {
  const [width, setWidth] = useState(0);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const maxWidth = 296;
    const increment = 1;
    const intervalTime = 10;
    const interval = setInterval(() => {
      setWidth(prevWidth => {
        const newWidth = prevWidth + increment;
        if (newWidth >= maxWidth) {
          clearInterval(interval);
          navigate('/wslandingpage'); // Redirect to the landing page
          return maxWidth;
        }
        return newWidth;
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="loadingbarpage2">
      <img className="bg1" alt="" src="/bg1.png" />
      <div className="bar-gray" />
      <img className="wildcat-icon" alt="" src="/wildcat-icon.png" />
      <i className="intro-line">Wildcat One Tap</i>
      <div className="bar-red" style={{ width: `${width}px` }} />
    </div>
  );
};

export default LoadingBar2;

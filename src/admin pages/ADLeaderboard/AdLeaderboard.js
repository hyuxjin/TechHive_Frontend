import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import AdNavBar from '../../components/AdNavBar';
import './AdLeaderboard.css';

const leaderboardData = [
  { position: 'first', name: 'Dawn Marie Gumagay', points: 100 },
  { position: 'second', name: 'Areej Charisse Corbete', points: 50 },
  { position: 'third', name: 'Gelu Marie Ursal', points: 20 },
];

const AdLeaderboard = () => {
  return (
    <div className="ad-leaderboard-container">
      <AdNavBar />
      <img 
        src={`${process.env.PUBLIC_URL}/leaderboardheadersu.png`} 
        alt="Leaderboard Header" 
        className="leaderboard-header-image" 
      />
      
      <Box className="leaderboard-content">
        {leaderboardData.map((user, index) => (
          <Box key={index} className={`leaderboard-row ${user.position}`}>
            <Avatar 
              src={`${process.env.PUBLIC_URL}/placeholder-${user.position}.png`} 
              alt={`${user.position} place`} 
              className="leaderboard-avatar" 
            />
            <Typography variant="h6" className="leaderboard-name">{user.name}</Typography>
            <Typography variant="body1" className="leaderboard-points">{user.points} points</Typography>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default AdLeaderboard;

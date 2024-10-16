import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoadingBar1 from './loadingbar/LoadingBar1';
import ADSignIn from './admin pages/ADSignIn/SignIn';
import AdHome from './admin pages/ADHome/AdHome';
import AdEntry from './admin pages/ADEntry/AdEntry';
import AdLeaderboard from './admin pages/ADLeaderboard/AdLeaderboard';
import AdProfile from './admin pages/ADProfile/AdProfile';
import AdLogout from './admin pages/ADLogout/Logout';
import AdInsight from './admin pages/ADInsight/AdInsight';
import LogoutDialog from './components/LogoutDialog'; // Corrected import path
import SUSignIn from './SuperUser pages/SUSignIn/SUSignIn';
import SUHome from './SuperUser pages/SUHome/SUHome';
import SUInsight from './SuperUser pages/SUInsight/SUInsight';
import SUDirectory from './SuperUser pages/SUDirectory/SUDirectory';
import SULeaderboard from './SuperUser pages/SULeaderboard/SULeaderboard';
import SUProfile from './SuperUser pages/SUProfile/SUProfile';

const App = () => {
  const handleClose = () => {
    console.log('Pop-up closed');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/loadingbar1" />} />
        <Route path="/loadingbar1" element={<LoadingBar1 />} />
        <Route path="/adsignin" element={<ADSignIn />} />
        <Route path="/adhome" element={<AdHome />} />
        <Route path="/adentry" element={<AdEntry />} />
        <Route path="/adleaderboard" element={<AdLeaderboard />} />
        <Route path="/adprofile" element={<AdProfile />} />
        <Route path="/adlogout" element={<AdLogout />} />
        <Route path="/adinsight" element={<AdInsight />} />
        <Route path="/logoutdialog" element={<LogoutDialog />} />
        <Route path="/susignin" element={<SUSignIn />} />
        <Route path="/suhome" element={<SUHome />} />
        <Route path="/suinsight" element={<SUInsight />} />
        <Route path="/sudirectory" element={<SUDirectory />} />
        <Route path="/suleaderboard" element={<SULeaderboard />} />
        <Route path="/suprofile" element={<SUProfile />} />
       </Routes>
    </Router>
  );
};

export default App;

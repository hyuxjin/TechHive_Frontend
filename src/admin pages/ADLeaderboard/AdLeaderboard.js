import { useState, useEffect } from "react";
import "./AdLeaderboard.css";
import AdNavBar from "../../components/AdNavBar";

const AdLeaderboard = () => {
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8080/user/getAllUsers");
      const data = await response.json();
      // Sort users by points, then by pointsAchievedAt
      const sortedUsers = data.sort((a, b) => {
        if (b.points === a.points) {
          return new Date(b.pointsAchievedAt) - new Date(a.pointsAchievedAt);
        }
        return b.points - a.points;
      });
      console.log("Fetched and sorted users:", sortedUsers); // Debugging log
      setUsers(sortedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch leaderboard rankings from /api/leaderboard/rankings endpoint
  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/leaderboard/rankings");
      const data = await response.json();
      setLeaderboard(data);
      console.log("Fetched leaderboard data:", data); // Log leaderboard to avoid unused warning
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    }
  };

  // Fetch users only on component mount
  useEffect(() => {
    fetchUsers();
    fetchLeaderboard();
  }, []);

  const champions = users.filter((user) => user.points >= 100);
  const prowlers = users.filter((user) => user.points >= 80 && user.points < 100);
  const cubs = users.filter((user) => user.points < 80);

  if (loading) {
    return <div>Loading...</div>; // Simple loading indicator
  }

  return (
    <div className="ad-leaderboards">
      <AdNavBar />
      <img className="adLeaderboardsTitle" alt="" src="/WL.png" />


      <div className="adleaderboard-container">
        {/* Champions Column */}
        <div className="adleaderboard-column adchampion-column">
          <h3>Champion (100+ Points)</h3>
          {champions.length > 0 ? (
            champions.map((user, index) => (
              <div key={index} className="adleaderboard-card">
                <img src="/Wildcat-Champion.png" alt="Champion Badge" className="adbadge" />
                <div className="aduser-info">
                  <div className="aduser-name">{user.fullName}</div>
                  <div className="aduser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="adtrophy-container">
                  {index === 0 ? (
                    <div className="adgold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="adsilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="adbronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="adtrophy-icon" />
                    </div>
                  ) : (
                    <div className="adno-trophy"></div> // Display nothing for users without a trophy
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No champions yet.</p>
          )}
        </div>

        {/* Prowlers Column */}
        <div className="adleaderboard-column adprowler-column">
          <h3>Prowler (80-100 Points)</h3>
          {prowlers.length > 0 ? (
            prowlers.map((user, index) => (
              <div key={index} className="adleaderboard-card">
                <img src="/Wildcat-Prowler.png" alt="Prowler Badge" className="adbadge" />
                <div className="aduser-info">
                  <div className="aduser-name">{user.fullName}</div>
                  <div className="aduser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="adtrophy-container">
                  {index === 0 ? (
                    <div className="adgold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="adsilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="adbronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="adtrophy-icon" />
                    </div>
                  ) : (
                    <div className="adno-trophy"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No prowlers yet.</p>
          )}
        </div>

        {/* Cubs Column */}
        <div className="adleaderboard-column adcub-column">
          <h3>Cub (0-80 Points)</h3>
          {cubs.length > 0 ? (
            cubs.map((user, index) => (
              <div key={index} className="adleaderboard-card">
                <img src="/Wildcat-Pub.png" alt="Cub Badge" className="adbadge" />
                <div className="aduser-info">
                  <div className="aduser-name">{user.fullName}</div>
                  <div className="aduser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="adtrophy-container">
                  {index === 0 ? (
                    <div className="adgold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="adsilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="adtrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="adbronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="adtrophy-icon" />
                    </div>
                  ) : (
                    <div className="adno-trophy"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No cubs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdLeaderboard;

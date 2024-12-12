import { useState, useEffect } from "react";
import "./SULeaderboard.css";
import SUNavBar from "../../components/SUNavBar";

const SULeaderboard = () => {
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const response = await fetch("https://techhivebackend-production-86d4.up.railway.app/user/getAllUsers");
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
      const response = await fetch("https://techhivebackend-production-86d4.up.railway.app/api/leaderboard/rankings");
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
    <div className="su-leaderboards">
      <SUNavBar />
      <img className="suLeaderboardsTitle" alt="" src="/WL.png" />


      <div className="suleaderboard-container">
        {/* Champions Column */}
        <div className="suleaderboard-column suchampion-column">
          <h3>Champion (100+ Points)</h3>
          {champions.length > 0 ? (
            champions.map((user, index) => (
              <div key={index} className="suleaderboard-card">
                <img src="/Wildcat-Champion.png" alt="Champion Badge" className="subadge" />
                <div className="suuser-info">
                  <div className="suuser-name">{user.fullName}</div>
                  <div className="suuser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="sutrophy-container">
                  {index === 0 ? (
                    <div className="sugold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="susilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="subronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="sutrophy-icon" />
                    </div>
                  ) : (
                    <div className="suno-trophy"></div> // Display nothing for users without a trophy
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No champions yet.</p>
          )}
        </div>

        {/* Prowlers Column */}
        <div className="suleaderboard-column suprowler-column">
          <h3>Prowler (80-100 Points)</h3>
          {prowlers.length > 0 ? (
            prowlers.map((user, index) => (
              <div key={index} className="suleaderboard-card">
                <img src="/Wildcat-Prowler.png" alt="Prowler Badge" className="subadge" />
                <div className="suuser-info">
                  <div className="suuser-name">{user.fullName}</div>
                  <div className="suuser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="sutrophy-container">
                  {index === 0 ? (
                    <div className="sugold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="susilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="subronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="sutrophy-icon" />
                    </div>
                  ) : (
                    <div className="suno-trophy"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No prowlers yet.</p>
          )}
        </div>

        {/* Cubs Column */}
        <div className="suleaderboard-column sucub-column">
          <h3>Cub (0-80 Points)</h3>
          {cubs.length > 0 ? (
            cubs.map((user, index) => (
              <div key={index} className="suleaderboard-card">
                <img src="/Wildcat-Pub.png" alt="Cub Badge" className="subadge" />
                <div className="suuser-info">
                  <div className="suuser-name">{user.fullName}</div>
                  <div className="suuser-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="sutrophy-container">
                  {index === 0 ? (
                    <div className="sugold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="susilver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="sutrophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="subronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="sutrophy-icon" />
                    </div>
                  ) : (
                    <div className="suno-trophy"></div>
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

export default SULeaderboard;

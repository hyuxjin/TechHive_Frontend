import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./WSLeaderboards.css";
import WSNavBar from '../WSHomepage/WSNavBar';

const WSLeaderboards = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  const onHomeTextClick = useCallback(() => {
    navigate("/wshomepage");
  }, [navigate]);

  const onREPORTSClick = useCallback(() => {
    navigate("/wsreport");
  }, [navigate]);

  const onINSIGHTClick = useCallback(() => {
    navigate("/insightanalytics");
  }, [navigate]);

  const onPROFILEClick = useCallback(() => {
    navigate("/wsprofile");
  }, [navigate]);

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
    <div className="ws-leaderboards">
      <WSNavBar />
      <img className="LeaderboardsTitle" alt="" src="/WL.png" />


      <div className="leaderboard-container">
        {/* Champions Column */}
        <div className="leaderboard-column champion-column">
          <h3>Champion (100+ Points)</h3>
          {champions.length > 0 ? (
            champions.map((user, index) => (
              <div key={index} className="leaderboard-card">
                <img src="/Wildcat-Champion.png" alt="Champion Badge" className="badge" />
                <div className="user-info">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="trophy-container">
                  {index === 0 ? (
                    <div className="gold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="silver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="bronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="trophy-icon" />
                    </div>
                  ) : (
                    <div className="no-trophy"></div> // Display nothing for users without a trophy
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No champions yet.</p>
          )}
        </div>

        {/* Prowlers Column */}
        <div className="leaderboard-column prowler-column">
          <h3>Prowler (80-100 Points)</h3>
          {prowlers.length > 0 ? (
            prowlers.map((user, index) => (
              <div key={index} className="leaderboard-card">
                <img src="/Wildcat-Prowler.png" alt="Prowler Badge" className="badge" />
                <div className="user-info">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="trophy-container">
                  {index === 0 ? (
                    <div className="gold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="silver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="bronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="trophy-icon" />
                    </div>
                  ) : (
                    <div className="no-trophy"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p>No prowlers yet.</p>
          )}
        </div>

        {/* Cubs Column */}
        <div className="leaderboard-column cub-column">
          <h3>Cub (0-80 Points)</h3>
          {cubs.length > 0 ? (
            cubs.map((user, index) => (
              <div key={index} className="leaderboard-card">
                <img src="/Wildcat-Pub.png" alt="Cub Badge" className="badge" />
                <div className="user-info">
                  <div className="user-name">{user.fullName}</div>
                  <div className="user-points">{user.points} pts</div>
                </div>
                {/* Trophy Logic: Only first 3 users get trophies */}
                <div className="trophy-container">
                  {index === 0 ? (
                    <div className="gold-background">
                      <img src="trophy.png" alt="Gold Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 1 ? (
                    <div className="silver-background">
                      <img src="trophy.png" alt="Silver Trophy" className="trophy-icon" />
                    </div>
                  ) : index === 2 ? (
                    <div className="bronze-background">
                      <img src="trophy.png" alt="Bronze Trophy" className="trophy-icon" />
                    </div>
                  ) : (
                    <div className="no-trophy"></div>
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

export default WSLeaderboards;

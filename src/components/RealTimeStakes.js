import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { io } from "socket.io-client";
import { fetchUsers } from "../services/userService";
import { fetchLiveGame } from "../services/gameService";
import "./index.css";

const socket = io("https://api.fungaming.in");

const RealTimeStakes = () => {
  const [users, setUsers] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);

        const liveGameResponse = await fetchLiveGame();
        setGameData(liveGameResponse.game);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial data:", error);
        setLoading(false);
      }
    };

    socket.on("game-update", (data) => {
      if (gameData && data.gameNumber === gameData.gameNumber) {
        setGameData((prevState) => ({
          ...prevState,
          stakes: data.stakes,
        }));
      }
    });

    socket.on("game-result", (data) => {
      if (data.gameNumber === gameData.gameNumber) {
        setGameData((prevState) => ({
          ...prevState,
          stakes: [],
        }));
      }
    });

    loadInitialData();

    return () => {
      socket.disconnect();
    };
  }, [gameData]);

  const getUserStakes = (userId) => {
    return gameData
      ? gameData.stakes.reduce((userStakes, stake) => {
          stake.users.forEach((user) => {
            if (user.userId === userId) {
              userStakes.push({
                gameNumber: gameData.gameNumber,
                stakeAmount: stake.totalStake,
                stakeNumber: stake.number,
                userAmount: user.amount,
              });
            }
          });
          return userStakes;
        }, [])
      : [];
  };

  const activeUsers = users.filter(
    (user) => getUserStakes(user._id).length > 0
  );
  const inactiveUsers = users.filter(
    (user) => getUserStakes(user._id).length === 0
  );

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActiveUsers = activeUsers.slice(startIndex, endIndex);
  const currentInactiveUsers = inactiveUsers.slice(startIndex, endIndex);

  const totalActivePages = Math.ceil(activeUsers.length / itemsPerPage);
  const totalInactivePages = Math.ceil(inactiveUsers.length / itemsPerPage);

  if (loading) {
    return <div>Loading players and stakes...</div>;
  }

  return (
    <Layout>
      <div>
        <h2>Real-Time Stakes</h2>

        {/* Currently Playing Players Section */}
        <h3>Currently Playing Players</h3>
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Game Number</th>
              <th>Total Stake</th>
              <th>Bid Number</th>
              <th>Player Stake</th>
            </tr>
          </thead>
          <tbody>
            {currentActiveUsers.map((user) => {
              const userStakes = getUserStakes(user._id);
              return userStakes.map((stake, index) => (
                <tr key={`${user._id}-${index}`}>
                  <td>{index === 0 ? user.username : ""}</td>
                  <td>{stake.gameNumber}</td>
                  <td>{stake.stakeAmount}</td>
                  <td>{stake.stakeNumber}</td>
                  <td>{stake.userAmount}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>

        {/* Pagination for Currently Playing Players */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalActivePages }, (_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalActivePages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>

        {/* Inactive Players Section */}
        <h3>Inactive Players</h3>
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
            </tr>
          </thead>
          <tbody>
            {currentInactiveUsers.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination for Inactive Players */}
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalInactivePages }, (_, index) => (
            <button
              key={index + 1}
              className={currentPage === index + 1 ? "active" : ""}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            disabled={currentPage === totalInactivePages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default RealTimeStakes;

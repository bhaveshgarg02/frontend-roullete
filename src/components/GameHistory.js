import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { fetchAllGames } from "../services/gameService"; // Import the updated fetchAllGames API function
const moment = require("moment-timezone");
const GameHistory = () => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(""); // State for selected date filter
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [totalPages, setTotalPages] = useState(1); // State for total pages
  const [selectedStakeDetails, setSelectedStakeDetails] = useState(null); // State for selected stake's details to show in popup

  const loadGames = async (date, page) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllGames({ date, page });
      setGames(response.games);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError("Error fetching all games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames(selectedDate, currentPage);
  }, [selectedDate, currentPage]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleStakeClick = (stake) => {
    setSelectedStakeDetails(stake); // Set the selected stake to show in the popup
  };

  const handleClosePopup = () => {
    setSelectedStakeDetails(null); // Close the popup by clearing the details
  };

  if (loading) {
    return <div>Loading games...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Layout>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>All Games</h1>

        {/* Date Filter */}
        <div style={{ marginBottom: "20px" }}>
          <label>
            Filter by Date:
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              style={{ marginLeft: "10px", padding: "5px" }}
            />
          </label>
        </div>

        {games.length === 0 ? (
          <p>
            {selectedDate
              ? `No games found for the selected date: ${<td>{moment(selectedDate).tz("Asia/Kolkata").format("YYYY-MM-DD")}</td>
            }`
              : "No games available."}
          </p>
        ) : (
          <>
            <table
              border="1"
              style={{
                width: "100%",
                marginBottom: "20px",
                borderCollapse: "collapse",
              }}
            >
              <thead>
                <tr>
                  <th>Game Number</th>
                  <th>Date</th>
                  {[...Array(10).keys()].map((number) => (
                    <th key={number}>{number}</th>
                  ))}
                  <th>System Winning Number</th>
                  <th>Admin Winning Number</th>
                  <th>Winning Number</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.gameNumber}>
                    <td>{game.gameNumber}</td>
                    <td>{new Date(game.date).toLocaleDateString()}</td>
                    {[...Array(10).keys()].map((number) => {
                      const stakeForNumber = game.stakes.find(
                        (stake) => stake.number === number
                      );
                      const totalStake = stakeForNumber
                        ? stakeForNumber.totalStake
                        : 0;
                      return (
                        <td
                          key={number}
                          onClick={() =>
                            stakeForNumber && handleStakeClick(stakeForNumber)
                          } // Show popup on click
                          style={{ cursor: "pointer" }}
                        >
                          {totalStake}
                        </td>
                      );
                    })}
                    <td>{game.systemWinningNumber}</td>
                    <td>{game.winningNumberByAdmin}</td>
                    <td>{game.winningNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{ marginRight: "10px", padding: "5px 10px" }}
              >
                Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{ marginLeft: "10px", padding: "5px 10px" }}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Popup for showing the user details of the selected stake */}
        {selectedStakeDetails && (
          <div style={popupStyle}>
            <div style={popupContentStyle}>
              <h3>Stake Details for Number {selectedStakeDetails.number}</h3>
              <table
                border="1"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStakeDetails.users.map((user, idx) => (
                    <tr key={idx}>
                      <td>{user.name}</td>
                      <td>{user.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                onClick={handleClosePopup}
                style={{ padding: "5px 10px", marginTop: "10px" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Styles for popup
const popupStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const popupContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "5px",
  width: "300px",
  textAlign: "center",
};

export default GameHistory;

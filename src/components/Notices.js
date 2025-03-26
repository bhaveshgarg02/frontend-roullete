import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {  fetchNotices } from "../services/loginAdmin"; // Import the service functions
import { sendNotice } from "../services/gameService";
const Notices = () => {
  const [notices, setNotices] = useState([]); // State to store fetched notices
  const [showModal, setShowModal] = useState(false); // Modal visibility
  const [message, setMessage] = useState(""); // Notice message
  const [recipient, setRecipient] = useState("players"); // Default to "players"
  const [currentPage, setCurrentPage] = useState(1); // Current page for pagination
  const noticesPerPage = 10; // Number of notices per page

  // Fetch notices when the component mounts
  useEffect(() => {
    const getNotices = async () => {
      try {
        const fetchedNotices = await fetchNotices(); // Fetch all notices
        setNotices(fetchedNotices); // Update the notices state with fetched data
      } catch (error) {
        console.error("Error fetching notices:", error);
      }
    };
    getNotices();
  }, []);

  // Handle sending a notice
  const handleSendNotice = async () => {
    try {
      const type = recipient === "both" ? "general" : recipient; // Set type based on recipient
      const response = await sendNotice(message, type); // Send the notice to the backend
      console.log("Notice sent:", response);

      // Close the modal and reset fields
      setShowModal(false);
      setMessage(""); // Clear the message input

      // Re-fetch notices after sending
      const fetchedNotices = await fetchNotices(); // Fetch updated notices
      setNotices(fetchedNotices); // Update the state with the latest notices
    } catch (error) {
      console.error("Error sending notice:", error);
    }
  };

  // Sort notices by latest first
  const sortedNotices = notices.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calculate pagination
  const indexOfLastNotice = currentPage * noticesPerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticesPerPage;
  const currentNotices = sortedNotices.slice(indexOfFirstNotice, indexOfLastNotice);
  const totalPages = Math.ceil(notices.length / noticesPerPage);

  return (
    <Layout>
      <div>
        <h1>Notices</h1>
        <button onClick={() => setShowModal(true)}>Create Notice</button>

        {/* Modal for creating a new notice */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content-main">
              <h2>Create a Notice</h2>
              <textarea
                placeholder="Enter your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows="4"
                cols="50"
              />
              <div>
                <label>
                  <input
                    type="radio"
                    value="user"
                    checked={recipient === "user"}
                    onChange={() => setRecipient("user")}
                  />
                  Send to All Players
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    value="agent"
                    checked={recipient === "agent"}
                    onChange={() => setRecipient("agent")}
                  />
                  Send to All Agents
                </label>
              </div>
              <div>
                <label>
                  <input
                    type="radio"
                    value="general"
                    checked={recipient === "general"}
                    onChange={() => setRecipient("general")}
                  />
                  Send to Both Agents and Players
                </label>
              </div>

              <button onClick={handleSendNotice}>Send Notice</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Display existing notices in a table format */}
        {notices.length > 0 ? (
          <>
            <table>
              <thead>
                <tr>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {currentNotices.map((notice) => (
                  <tr key={notice._id}>
                    <td>{notice.message}</td>
                    <td>{notice.type}</td>
                    <td>{new Date(notice.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(currentPage - 1)} 
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span className="mt-1">Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(currentPage + 1)} 
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p>No notices available</p>
        )}
      </div>
    </Layout>
  );
};

export default Notices;

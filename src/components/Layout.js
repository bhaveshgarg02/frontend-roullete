import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  fetchUnreadNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/loginAdmin";
import "../assets/css/kaiadmin.min.css"; // Assuming this is your custom CSS for layout
import "../assets/css/fonts.css"; // Assuming this is your custom fonts
import "./index.css"; // Assuming this contains custom styles

const Layout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    sessionStorage.removeItem("token");
    navigate("/"); // If stored in sessionStorage
  };

  const loadNotifications = async () => {
    try {
      const unreadNotifications = await fetchUnreadNotifications();

      setNotifications(unreadNotifications);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  // Mark a notification as read

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };
  const handleRemoveNotification = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleNotificationClick = (notif) => {
    if (notif.type === "Buy Coin Request") {
      navigate("/fund-requests");
    } else if (notif.type === "Withdrawal Coin Request") {
      navigate("/withdrawls");
    }
    setShowNotifications(false); // Close popup after navigation
  };
  return (
    <div className="wrapper">
      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
        data-background-color="dark"
      >
        <div className="sidebar-logo">
          <div className="logo-header" data-background-color="dark">
            <div className="white">Roulette Game</div>
          </div>
        </div>
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
              <li className="nav-item">
                <NavLink
                  to="/admin-dashboard"
                  className="nav-link"
                  activeClassName="active" // Add active class when this link is active
                  exact
                >
                  <i className="fa fa-home"></i>
                  <p>Dashboard</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/admin-profile"
                  className="nav-link"
                  activeClassName="active" // Add active class when this link is active
                  exact
                >
                  <i className="fa fa-user"></i>
                  <p>View Profile</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/users"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-users"></i>
                  <p>Manage Users</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agents"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-user-secret" aria-hidden="true"></i>
                  <p>Manage Agents</p>
                </NavLink>
              </li>
              <li className="nav-item">
  <NavLink
    to="/fund-requests"
    className="nav-link"
    activeClassName="active"
    style={{ color: "green" }}
  >
    <i className="fa fa-pen-square" style={{ color: "green" }}></i>
    <p style={{ color: "green" }}>Buy Coin Requests</p>
  </NavLink>
</li>
<li className="nav-item">
  <NavLink
    to="/withdrawls"
    className="nav-link"
    activeClassName="active"
    style={{ color: "green" }}
  >
    <i className="fa fa-wallet" style={{ color: "green" }}></i>
    <p style={{ color: "green" }}>Withdrawal Coin Request</p>
  </NavLink>
</li>

              <li className="nav-item">
                <NavLink
                  to="/live-game"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-gamepad" aria-hidden="true"></i>
                  <p>Live Game</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/notices"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-sticky-note" aria-hidden="true"></i>
                  <p>Manage Notices</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/all-games"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-history" aria-hidden="true"></i>
                  <p>Game History</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/user-stakes"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-users" aria-hidden="true"></i>
                  <p>Real Time Stakes For Players</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/transaction-history"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-receipt"></i>
                  <p>Transaction History</p>
                </NavLink>
              </li>
              
              <li className="nav-item">
                <NavLink
                  to="/"
                  className="nav-link"
                  activeClassName="active"
                  onClick={handleLogout}
                >
                  <i className="fa fa-sign-out-alt"></i>
                  <p>Logout</p>
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        {/* Toggle Button */}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i
            className={`fa ${isSidebarCollapsed ? "fa-bars" : "fa-times"}`}
          ></i>
        </button>
      </div>
      {/* End Sidebar */}

      <div className="header">
        <div className="header-right">
          {/* Notification Icon */}
          <div
            className="notification-icon"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <i className="fa fa-bell"></i>
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </div>

          {/* Notification Popup */}
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              <ul className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <li
                      key={notif._id}
                      className={`notification-item ${
                        notif.isRead ? "" : "unread"
                      }`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="notification-content">
                        <span
                          className={`notif-type ${notif.type
                            .replace(/\s/g, "-")
                            .toLowerCase()}`}
                        >
                          {notif.type}
                        </span>
                        <p>{notif.message}</p>
                      </div>
                      <button
                        className="close-btn"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent navigating when clicking ❌
                          handleRemoveNotification(notif._id);
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))
                ) : (
                  <p className="no-notifications">No new notifications</p>
                )}
              </ul>
            </div>
          )}

          {/* Profile Section */}
          <NavLink to="/admin-profile" className="profile-section">
            <img
              src="https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg"
              alt="Profile"
              className="profile-image"
            />
            <span>Super Admin</span>
          </NavLink>

          {/* Logout Icon */}
          <div
            className="logout-icon"
            onClick={handleLogout}
            title="Logout"
          >
            <i className="fa fa-sign-out-alt"></i>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className={`main-panel ${isSidebarCollapsed ? "collapsed" : ""}`}>
          <div className="container">
            {/* Render the children (the specific page content) */}
            {children}
          </div>
        </div>
      </div>
      {/* End Main Content */}
    </div>
  );
};

export default Layout;

import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../assets/css/kaiadmin.min.css"; // Custom admin styles
import "../assets/css/fonts.css"; // Custom fonts
import "./index.css"; // Any additional custom styles

const LayoutAgent = ({ children, title = "Agent Dashboard" }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear token
    sessionStorage.removeItem("token"); // If stored in sessionStorage
  };
  

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <div
        className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}
        data-background-color="dark"
      >
        <div className="sidebar-wrapper scrollbar scrollbar-inner">
          <div className="logo-header" data-background-color="dark">
            <div className="white">Roulette Game</div>
          </div>
          <div className="sidebar-content">
            <ul className="nav nav-secondary">
              <li className="nav-item">
                <NavLink
                  to="/agent-dashboard"
                  className="nav-link"
                  activeClassName="active"
                  exact
                >
                  <i className="fa fa-home"></i>
                  <p>Dashboard</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-live-game"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-gamepad" aria-hidden="true"></i>
                  <p>Live Game</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-transaction-history"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-receipt"></i>
                  <p>Transaction History</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-request-funds"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-credit-card"></i>
                  <p>Request Funds from Admin</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-transfer-funds"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-exchange-alt"></i>
                  <p>Transfer Funds to Player</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-game-history"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-history"></i>
                  <p>Game History</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-withdrawls"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-wallet"></i>
                  <p>Request Withdrawals & History</p>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  to="/agent-withdrawl-approve"
                  className="nav-link"
                  activeClassName="active"
                >
                  <i className="fa fa-check-circle"></i>
                  <p>Approve Withdrawals for Users</p>
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
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          <i
            className={`fa ${isSidebarCollapsed ? "fa-bars" : "fa-times"}`}
          ></i>
        </button>
      </div>
      {/* End Sidebar */}

      {/* Main Content Area */}
      <div className={`${isSidebarCollapsed ? "collapsed" : ""}`}>
        <div className="main-panel">
          <div className="container">
            <div className="page-inner">
              {/* Render child components */}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutAgent;

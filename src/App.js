import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Agents from './components/Agents';
import FundRequests from './components/FundRequests';
import LiveGame from './components/LiveGame';
import Notices from './components/Notices';
import LockResult from './components/LockResult';
import NotificationManager from './components/NotificationManager';
import GameHistory from './components/GameHistory';
import RealTimeStakes from './components/RealTimeStakes';
import TransactionHistory from './components/TransactionHistory';
import Withdrawals from './components/Withdrawals';
import Login from './components/Login';
import LoginAgent from './components/LoginAgent';
import LoginAdmin from './components/LoginAdmin';
import AgentsDashboard from './components/AgentDashboard';
import AgentLiveGame from './components/AgentLiveGame';
import AgentTransactionHistory from './components/AgentTransactionHistory';
import AgentRequestFunds from './components/AgentRequestFunds';
import AgentTransferFunds from './components/AgentTransferFunds';
import AgentGameHistory from './components/AgentGameHistory';
import AgentWithdrawl from './components/AgentWithdrawal'
import PrivateRoute from './components/PrivateRoute'; // Import PrivateRoute
import UserDetail from './components/UserDetail'
import AgentDetail from './components/AgentDetail'
import AgentWithdrawalApprove from './components/AgentWithdrawlApprove'
import AdminProfile from './components/AdminProfile';
const DynamicLoginRoute = () => {
  const hostname = window.location.hostname;
  let LoginComponent = Login;
  if (hostname.startsWith('admin')) {
    LoginComponent = LoginAdmin;
  } else if (hostname.startsWith('agent')) {
    LoginComponent = LoginAgent;
  }
  return <LoginComponent />;
};

const App = () => {

  return (
    <Router>
      <Routes>
        {/* Route for Login page */}
        <Route path="/login" element={<Login />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/login-agent" element={<LoginAgent />} />

        {/* Route for Admin */}
        <Route path="/" element={<DynamicLoginRoute />} />
        <Route path="/admin-profile" element={<PrivateRoute element={AdminProfile} requiredRole="admin" />} />
        <Route path="/admin-dashboard" element={<PrivateRoute element={Dashboard} requiredRole="admin" />} />
        <Route path="/users" element={<PrivateRoute element={Users} requiredRole="admin" />} />
        <Route path="/user/:userId" element = {<PrivateRoute element={UserDetail} requiredRole="admin" />} />
        <Route path="/agent/:agentId" element = {<PrivateRoute element={AgentDetail} requiredRole="admin" />} />
        <Route path="/agents" element={<PrivateRoute element={Agents} requiredRole="admin" />} />
        <Route path="/fund-requests" element={<PrivateRoute element={FundRequests} requiredRole="admin" />} />
        <Route path="/live-game" element={<PrivateRoute element={LiveGame} requiredRole="admin" />} />
        <Route path="/notices" element={<PrivateRoute element={Notices} requiredRole="admin" />} />
        <Route path="/lock-result/:gameId" element={<PrivateRoute element={LockResult} requiredRole="admin" />} />
        <Route path="/send-notification" element={<PrivateRoute element={NotificationManager} requiredRole="admin" />} />
        <Route path="/all-games" element={<PrivateRoute element={GameHistory} requiredRole="admin" />} />
        <Route path="/user-stakes" element={<PrivateRoute element={RealTimeStakes} requiredRole="admin" />} />
        <Route path="/transaction-history" element={<PrivateRoute element={TransactionHistory} requiredRole="admin" />} />
        <Route path="/withdrawls" element={<PrivateRoute element={Withdrawals} requiredRole="admin" />} />

        {/* Route for Agent */}
        <Route path="/agent-dashboard" element={<PrivateRoute element={AgentsDashboard} requiredRole="agent" />} />
        <Route path="/agent-live-game" element={<PrivateRoute element={AgentLiveGame} requiredRole="agent" />} />
        <Route path="/agent-transaction-history" element={<PrivateRoute element={AgentTransactionHistory} requiredRole="agent" />} />
        <Route path="/agent-request-funds" element={<PrivateRoute element={AgentRequestFunds} requiredRole="agent" />} />
        <Route path="/agent-transfer-funds" element={<PrivateRoute element={AgentTransferFunds} requiredRole="agent" />} />
        <Route path="/agent-game-history" element={<PrivateRoute element={AgentGameHistory} requiredRole="agent" />} />
        <Route path="/agent-withdrawls" element={<PrivateRoute element={AgentWithdrawl} requiredRole="agent" />} />
        <Route path="/agent-withdrawl-approve" element={<PrivateRoute element={AgentWithdrawalApprove} requiredRole="agent" />} />
        
      </Routes>
    </Router>
  );
};

export default App;

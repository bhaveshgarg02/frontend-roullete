import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAgentProfile } from '../services/transactionService';
import Layout from './Layout';
const moment = require("moment-timezone");
const AgentDetail = () => {
  const { agentId } = useParams(); // Get the agentId from the URL
  const [agent, setAgent] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // Manage active tab
  const [transactionsPage, setTransactionsPage] = useState(1); // Pagination state for transactions
  const [withdrawalsPage, setWithdrawalsPage] = useState(1); // Pagination state for withdrawals

  useEffect(() => {
    const loadAgentData = async () => {
      try {
        const agentData = await fetchAgentProfile(agentId);
        setAgent(agentData);
      } catch (error) {
        console.error('Error fetching agent data:', error);
      }
    };
    loadAgentData();
  }, [agentId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab); // Switch tabs
  };

  const handlePagination = (page, type) => {
    if (type === 'transactions') {
      setTransactionsPage(page);
    } else if (type === 'withdrawals') {
      setWithdrawalsPage(page);
    }
  };

  const paginateData = (data, page) => {
    const start = (page - 1) * 10;
    const end = page * 10;
    return data.slice(start, end);
  };

  const getTotalPages = (data) => {
    return Math.ceil(data.length / 10);
  };

  if (!agent) {
    return <div>Loading agent data...</div>;
  }

  return (
    <Layout>
    <div className="agent-detail-container">
      <h2>{agent.name}'s Details</h2>

      {/* Tab Navigation */}
      <div className="tabs">
        <button
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => handleTabChange('profile')}
        >
          Agent Profile
        </button>
        <button
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => handleTabChange('transactions')}
        >
          Transaction History
        </button>
        <button
          className={activeTab === 'withdrawals' ? 'active' : ''}
          onClick={() => handleTabChange('withdrawals')}
        >
          Withdrawal History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div>
            <h3>Agent Profile</h3>
            <table>
              <tbody>
                <tr>
                  <td><strong>Agent Name:</strong></td>
                  <td>{agent.name}</td>
                </tr>
                <tr>
                  <td><strong>Mobile:</strong></td>
                  <td>{agent.mobile}</td>
                </tr>
                <tr>
                  <td><strong>Wallet Balance:</strong></td>
                  <td>{agent.wallet}</td>
                </tr>
                <tr>
                  <td><strong>Banking Info:</strong></td>
                  <td>
                    {agent.upiId
                    ? agent.upiId
                    : agent.bankingInfo?.accountNumber && agent.bankingInfo?.ifscCode
                    ? `A/C No: ${agent.bankingInfo.accountNumber} - IFSC CODE : ${agent.bankingInfo.ifscCode}`
                    : "N/A"}</td>
                </tr>
                <tr>
                  <td><strong>Agent Active Since:</strong></td>
                  <td>{moment(agent.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Transaction History Tab */}
        {activeTab === 'transactions' && (
          <div>
            <h3>Transaction History</h3>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginateData(agent.transactionHistory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), transactionsPage)
                  .map((transaction) => (
                    <tr key={transaction._id}>
                      <td>{transaction.amount}</td>
                      <td>{transaction.type}</td>
                      <td>{transaction.description}</td>
                      <td>{transaction.status}</td>
                      <td>{moment(transaction.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* Pagination Controls for Transaction History */}
            <div>
              <button onClick={() => handlePagination(transactionsPage - 1, 'transactions')} disabled={transactionsPage === 1}>
                Previous
              </button>
              <span> Page {transactionsPage} of {getTotalPages(agent.transactionHistory)} </span>
              <button onClick={() => handlePagination(transactionsPage + 1, 'transactions')} disabled={agent.transactionHistory.length <= transactionsPage * 10}>
                Next
              </button>
            </div>
          </div>
        )}

        {/* Withdrawal History Tab */}
        {activeTab === 'withdrawals' && (
          <div>
            <h3>Withdrawal History</h3>
            <table>
              <thead>
                <tr>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Request Date</th>
                  <th>Processed Date</th>
                  <th>Transaction ID</th>
                </tr>
              </thead>
              <tbody>
                {paginateData(agent.withdrawalHistory.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)), withdrawalsPage)
                  .map((withdrawal) => (
                    <tr key={withdrawal._id}>
                      <td>{withdrawal.amount}</td>
                      <td>{withdrawal.status}</td>
                      <td>{moment(withdrawal.requestDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")}</td>
                      <td>
                        {withdrawal.processedDate
                          ? moment(withdrawal.processedDate).tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss")
                          : 'Pending'}
                      </td>
                      <td>{withdrawal.transactionId}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* Pagination Controls for Withdrawal History */}
            <div>
              <button onClick={() => handlePagination(withdrawalsPage - 1, 'withdrawals')} disabled={withdrawalsPage === 1}>
                Previous
              </button>
              <span> Page {withdrawalsPage} of {getTotalPages(agent.withdrawalHistory)} </span>
              <button onClick={() => handlePagination(withdrawalsPage + 1, 'withdrawals')} disabled={agent.withdrawalHistory.length <= withdrawalsPage * 10}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
};

export default AgentDetail;

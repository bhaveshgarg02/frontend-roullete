import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  activateUser,
} from "../services/userService";
import Layout from "../components/Layout";
// Import the Layout component
import "./index.css";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: "",
    mobile: "",
    upiId: "",
    accountNumber: "",
    ifscCode: "",
    isBankingInfo: false,
  });
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mobile, setMobile] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  // Fetch users on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const usersData = await fetchUsers();
        setUsers(usersData);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.error("Error loading users:", error);
      }
    };
    loadUsers();
  }, []);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= Math.ceil(users.length / usersPerPage)) {
      setCurrentPage(pageNumber);
    }
  };
  // Handle input changes for both creating and editing users
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editUser) {
      setEditUser((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handle mobile number changes
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length <= 10) {
      setMobile(value);
    }
  };

  // Handle creating a new user
  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newUser,
        mobile: `+91${mobile}`, // Add +91 prefix to mobile number
        bankingInfo: newUser.isBankingInfo
          ? {
              accountNumber: newUser.accountNumber,
              ifscCode: newUser.ifscCode,
            }
          : undefined,
      };

      if (newUser.isBankingInfo) {
        payload.upiId = ""; // Remove UPI ID if Banking Info is provided
      }

      await createUser(payload);
      setNewUser({
        username: "",
        mobile: "",
        upiId: "",
        accountNumber: "",
        ifscCode: "",
        isBankingInfo: false,
      });
      setMobile(""); // Reset mobile number
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  // Handle editing a user
  const handleEditUser = (user) => {
    const strippedMobile =
      user.mobile && user.mobile.startsWith("+91")
        ? user.mobile.replace("+91", "")
        : "";

    setEditUser({
      ...user,
      isBankingInfo: !!user.bankingInfo, // True if bankingInfo exists
      upiId: user.bankingInfo ? "" : user.upiId, // Clear UPI ID if bankingInfo exists
      accountNumber: user.bankingInfo?.accountNumber || "", // Set account number if bankingInfo exists
      ifscCode: user.bankingInfo?.ifscCode || "", // Set IFSC code if bankingInfo exists
    });

    setMobile(strippedMobile);
    setIsModalOpen(true);
  };

  // Handle updating a user
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = {
        ...editUser,
        mobile: `+91${mobile}`,
        bankingInfo: editUser.isBankingInfo
          ? {
              accountNumber: editUser.accountNumber,
              ifscCode: editUser.ifscCode,
            }
          : undefined,
      };

      if (editUser.isBankingInfo) {
        updatedUser.upiId = ""; // Remove UPI ID if Banking Info is provided
      }

      await updateUser(editUser._id, updatedUser);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
      setIsModalOpen(false);
      setEditUser(null); // Reset editUser
      setMobile(""); // Reset mobile number
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  // Handle deactivating a user
  const handleDeactivateUser = async (userId) => {
    try {
      await deleteUser(userId);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  // Handle activating a user
  const handleActivateUser = async (userId) => {
    try {
      await activateUser(userId);
      const updatedUsers = await fetchUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Error activating user:", error);
    }
  };

  if (loading) {
    return <div>Loading players...</div>;
  }

  return (
    <Layout>
      <div>
        <h2>Players Management</h2>
        <button
          onClick={() => {
            setEditUser(null);
            setNewUser({
              username: "",
              mobile: "",
              upiId: "",
              accountNumber: "",
              ifscCode: "",
              isBankingInfo: false,
            });
            setMobile(""); // Reset mobile input
            setIsModalOpen(true);
          }}
        >
          Add New Player
        </button>

        {/* Users Table */}
        <table>
          <thead>
            <tr>
              <th>Player Name</th>
              <th>Mobile</th>
              <th>Banking Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4">No players found.</td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <Link to={`/user/${user._id}`}>{user.username}</Link>
                  </td>
                  <td>{user.mobile}</td>
                  <td>
                    {user.upiId
                      ? user.upiId
                      : user.bankingInfo?.accountNumber &&
                        user.bankingInfo?.ifscCode
                      ? `A/C No: ${user.bankingInfo.accountNumber} - IFSC CODE : ${user.bankingInfo.ifscCode}`
                      : "N/A"}
                  </td>
                  <td>
                    {user.isDeactivated ? (
                      <button
                        className="edit-btn"
                        onClick={() => handleActivateUser(user._id)}
                      >
                        Activate
                      </button>
                    ) : (
                      <>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditUser(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeactivateUser(user._id)}
                        >
                          Deactivate
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Modal for Adding or Editing User */}
        {isModalOpen && (
          <div className="modal">
            <div className="modal-content-main">
              <h3>{editUser ? "Edit Player" : "Create New Player"}</h3>
              <form onSubmit={editUser ? handleUpdateUser : handleCreateUser}>
                <div>
                  <label>Player Name</label>
                  <input
                    type="text"
                    name="username"
                    value={editUser ? editUser.username : newUser.username}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Mobile Number</label>
                  <div className="mobile-code">
                    <span>+91</span>
                    <input
                      type="text"
                      value={mobile}
                      onChange={handleMobileChange}
                      placeholder="Enter mobile number"
                      className="mobile-number-input"
                      maxLength="10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="row">
                    <label className="col-md-6">
                      <input
                        type="radio"
                        name="isBankingInfo"
                        value={true}
                        checked={
                          editUser
                            ? editUser.isBankingInfo
                            : newUser.isBankingInfo
                        }
                        onChange={() =>
                          editUser
                            ? setEditUser({
                                ...editUser,
                                isBankingInfo: true,
                                upiId: "",
                              })
                            : setNewUser({
                                ...newUser,
                                isBankingInfo: true,
                                upiId: "",
                              })
                        }
                      />
                      Banking Info
                    </label>
                    <label className="col-md-6">
                      <input
                        type="radio"
                        name="isBankingInfo"
                        value={false}
                        checked={
                          editUser
                            ? !editUser.isBankingInfo
                            : !newUser.isBankingInfo
                        }
                        onChange={() =>
                          editUser
                            ? setEditUser({
                                ...editUser,
                                isBankingInfo: false,
                                accountNumber: "",
                                ifscCode: "",
                              })
                            : setNewUser({
                                ...newUser,
                                isBankingInfo: false,
                                accountNumber: "",
                                ifscCode: "",
                              })
                        }
                      />
                      UPI ID
                    </label>
                  </div>

                  {editUser
                    ? editUser.isBankingInfo
                      ? BankingFields(editUser, handleInputChange)
                      : UpiField(editUser, handleInputChange)
                    : newUser.isBankingInfo
                    ? BankingFields(newUser, handleInputChange)
                    : UpiField(newUser, handleInputChange)}
                </div>

                <div>
                  <button type="submit" className="edit-btn">
                    {editUser ? "Update Player" : "Create Player"}
                  </button>
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditUser(null);
                      setMobile("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className="pagination">
          <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </button>
          {Array.from({ length: Math.ceil(users.length / usersPerPage) }, (_, i) => (
            <button
              key={i + 1}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === Math.ceil(users.length / usersPerPage)}
          >
            Next
          </button>
        </div>
      
          </Layout>
  );
};

const UpiField = (user, handleInputChange) => (
  <input
    type="text"
    name="upiId"
    placeholder="Enter UPI ID"
    value={user.upiId || ""}
    onChange={handleInputChange}
    required
  />
);

const BankingFields = (user, handleInputChange) => (
  <>
    <input
      type="text"
      name="accountNumber"
      placeholder="Account Number"
      value={user.accountNumber || ""}
      onChange={handleInputChange}
      required
    />
    <input
      type="text"
      name="ifscCode"
      placeholder="IFSC Code"
      value={user.ifscCode || ""}
      onChange={handleInputChange}
      required
    />
  </>
);

export default Users;

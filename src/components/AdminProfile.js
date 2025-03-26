import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminProfile, changeAdminPassword, uploadAdminQRCode } from "../services/loginAdmin";
import Layout from "./Layout";

const AdminProfile = () => {
  const adminData = JSON.parse(localStorage.getItem("user"));
  const adminEmail = adminData?.email;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showQRUploader, setShowQRUploader] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false); // New state for upload process

  useEffect(() => {
    if (adminEmail) {
      fetchProfile(adminEmail);
    }
  }, [adminEmail]);

  const fetchProfile = async (email) => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminProfile(email);
      setProfile(data);
    } catch (err) {
      setError("Failed to fetch profile");
    }
    setLoading(false);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUploadQRCode = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }
  
    setUploading(true); // Start uploading state
    try {
      const result = await uploadAdminQRCode(profile._id, selectedFile);
      alert("QR Code uploaded successfully!");
      setProfile({ ...profile, qrcode: result.qrcodeUrl });
      setShowQRUploader(false); // Hide uploader after success
    } catch (error) {
      alert("Failed to upload QR Code.");
    }
    setUploading(false); // Stop uploading state
  };

  return (
    <Layout>
      <div style={styles.container}>
        <h2 style={styles.heading}>Admin Profile</h2>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
        {profile && (
          <div style={styles.profileBox}>
            <p><strong>ID:</strong> {profile._id}</p>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>

            {/* QR Code Display */}
            <div style={styles.qrSection}>
              <h3>Banking Details:</h3>
              {profile.qrcode ? (
                <img src={profile.qrcode} alt="QR Code" style={styles.qrImage} />
              ) : (
                <p>No QR Code uploaded</p>
              )}
            </div>

            {/* QR Upload Section */}
            {showQRUploader && (
              <div style={styles.uploadContainer}>
                <input type="file" accept="image/*" onChange={handleFileChange} />
                <button style={styles.button} onClick={handleUploadQRCode} disabled={uploading}>
  {uploading ? "Uploading..." : "Upload QR Code"}
</button>
              </div>
            )}

            {/* Buttons - Change Password and Change QR in same line */}
            <div style={styles.buttonContainer}>
            <button style={styles.button} onClick={() => setShowPasswordModal(true)}>
              Change Password
            </button>
              <button style={styles.button} onClick={() => setShowQRUploader(!showQRUploader)}>
                {showQRUploader ? "Cancel Changing" : "Change Banking Details"}
              </button>
            </div>
          </div>
        )}
        {showPasswordModal && <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />}
      </div>
    </Layout>
  );
};

const ChangePasswordModal = ({ onClose }) => {
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem("user"));
  const adminEmail = adminData?.email;
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New Password and Confirm Password do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await changeAdminPassword({ email: adminEmail, oldPassword, newPassword });
      alert("Password changed successfully. Please log in again.");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      setError("Failed to change password");
    }
    setLoading(false);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h3>Change Password</h3>
        <div style={styles.inputContainer}>
          <input
            type={showPasswords.old ? "text" : "password"}
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            style={styles.input}
          />
          <button style={styles.eyeButton} onClick={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}>
            {showPasswords.old ? "👁" : "🔒"}
          </button>
        </div>
        <div style={styles.inputContainer}>
          <input
            type={showPasswords.new ? "text" : "password"}
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input}
          />
          <button style={styles.eyeButton} onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}>
            {showPasswords.new ? "👁" : "🔒"}
          </button>
        </div>
        <div style={styles.inputContainer}>
          <input
            type={showPasswords.confirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <button style={styles.eyeButton} onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}>
            {showPasswords.confirm ? "👁" : "🔒"}
          </button>
        </div>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <div style={styles.modalButtons}>
          <button style={styles.button} onClick={handleChangePassword} disabled={loading}>
            {loading ? "Changing..." : "Change Password"}
          </button>
          <button style={styles.cancelButton} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    textAlign: "center",
    padding: "20px",
  },
  heading: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  profileBox: {
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    background: "#f9f9f9",
    textAlign: "left",
  },
  button: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  cancelButton: {
    marginTop: "10px",
    padding: "10px 15px",
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "10px",
    textAlign: "center",
    width: "350px",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "space-between",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  eyeButton: {
    marginLeft: "5px",
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "black"
  },
  qrSection: {
    marginTop: "15px",
    textAlign: "center",
  },
  qrImage: {
    width: "150px",
    height: "150px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginTop: "10px",
  },
  uploadContainer: {
    marginTop: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
};

export default AdminProfile;

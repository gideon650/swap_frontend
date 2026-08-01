import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCopy, FaCheck } from "react-icons/fa";
import axios from "axios";
import "./profile.css";

// Moved FormGroup OUTSIDE the Profile component to prevent re-rendering issues
const FormGroup = ({ type, placeholder, value, onChange, ariaLabel, name }) => (
  <div className="form-group">
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-label={ariaLabel}
      autoComplete="off"
      name={name}
    />
  </div>
);

const Profile = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "",
    account_number: "",
    referral_code: ""
  });
  const [newUsername, setNewUsername] = useState("");
  const [usernameCurrentPassword, setUsernameCurrentPassword] = useState("");
  const [passwordCurrentPassword, setPasswordCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [copied, setCopied] = useState({ account: false, referral: false });
  const [isLoading, setIsLoading] = useState(false);
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const portfolioResponse = await axios.get(`${API_BASE_URL}/portfolio/`, {
          headers: { Authorization: `Token ${token}` }
        });
        console.log("portfolioResponse:", portfolioResponse);

        const referralResponse = await axios.get(`${API_BASE_URL}/referral-code/`, {
          headers: { Authorization: `Token ${token}` }
        });
        console.log("referralResponse:", referralResponse);

        setUserInfo({
          username: portfolioResponse.data.user?.username || portfolioResponse.data.username || "",
          email: portfolioResponse.data.user?.email || portfolioResponse.data.email || "",
          account_number: portfolioResponse.data.account_number,
          referral_code: referralResponse.data.referral_code
        });
      } catch (error) {
        console.log("Error fetching user data:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        } else {
          setMessage({
            text: "Failed to load user information",
            type: "error"
          });
        }
      }
    };

    fetchUserData();
  }, [navigate, API_BASE_URL]);

  // Helper to extract error messages as string
  const extractErrorMessage = (error, fallback) => {
    if (error.response?.data) {
      if (typeof error.response.data === "string") {
        return error.response.data;
      } else if (typeof error.response.data === "object") {
        return Object.values(error.response.data).flat().join(" ");
      }
    }
    return fallback;
  };

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newUsername || !usernameCurrentPassword) {
      setMessage({ text: "All fields are required", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/profile/change-username/`,
        {
          current_password: usernameCurrentPassword,
          new_username: newUsername
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      if (response.data.status === "success") {
        setMessage({ text: "Username updated successfully", type: "success" });
        setUserInfo({ ...userInfo, username: newUsername });
        setNewUsername("");
        setUsernameCurrentPassword("");
      }
    } catch (error) {
      setMessage({
        text: extractErrorMessage(error, "Failed to update username"),
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!passwordCurrentPassword || !newPassword || !confirmPassword) {
      setMessage({ text: "All fields are required", type: "error" });
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ text: "Password must be at least 8 characters", type: "error" });
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/profile/change-password/`,
        {
          current_password: passwordCurrentPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        },
        {
          headers: { Authorization: `Token ${token}` }
        }
      );

      if (response.data.status === "success") {
        setMessage({ text: "Password updated successfully", type: "success" });
        setPasswordCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      setMessage({
        text: extractErrorMessage(error, "Failed to update password"),
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    setPasswordsMatch(e.target.value === newPassword);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [type]: true });
    setTimeout(() => {
      setCopied({ ...copied, [type]: false });
    }, 2000);
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-icon">
          <FaUser />
        </div>
        <h2>My Profile</h2>
      </div>

      <div className="profile-info">
        <div className="info-group">
          <label>Username</label>
          <p>{userInfo.username}</p>
        </div>
        <div className="info-group">
          <label>Email</label>
          <p>{userInfo.email}</p>
        </div>
        <div className="info-group">
          <label>Address</label>
          <div className="copyable-field">
            <p>{userInfo.account_number}</p>
            <button
              onClick={() => copyToClipboard(userInfo.account_number, "account")}
              className="copy-button"
              aria-label="Copy account number"
            >
              {copied.account ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
        <div className="info-group">
          <label>Invitation Code</label>
          <div className="copyable-field">
            <p>{userInfo.referral_code}</p>
            <button
              onClick={() => copyToClipboard(userInfo.referral_code, "referral")}
              className="copy-button"
              aria-label="Copy referral code"
            >
              {copied.referral ? <FaCheck /> : <FaCopy />}
            </button>
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-forms">
        <form onSubmit={handleUsernameChange} className="profile-form">
          <h3>Change Username</h3>
          <FormGroup
            type="text"
            placeholder="New Username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            ariaLabel="New Username"
            name="new-username"
          />
          <FormGroup
            type="password"
            placeholder="Current Password"
            value={usernameCurrentPassword}
            onChange={(e) => setUsernameCurrentPassword(e.target.value)}
            ariaLabel="Current Password for Username Change"
            name="username-current-password"
          />
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Username"}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="profile-form">
          <h3>Change Password</h3>
          <FormGroup
            type="password"
            placeholder="Current Password"
            value={passwordCurrentPassword}
            onChange={(e) => setPasswordCurrentPassword(e.target.value)}
            ariaLabel="Current Password for Password Change"
            name="password-current-password"
          />
          <FormGroup
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            ariaLabel="New Password"
            name="new-password"
          />
          <FormGroup
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            ariaLabel="Confirm New Password"
            name="confirm-new-password"
          />
          {!passwordsMatch && <p className="error-text">Passwords do not match</p>}
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
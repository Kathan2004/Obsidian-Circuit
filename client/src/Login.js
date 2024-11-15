import React from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import "./login.css"; // Import the CSS file

const Login = () => {
  const navigate = useNavigate();

  const connectToMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      // Check if connected
      if (accounts.length > 0) {
        console.log("Connected account:", accounts[0]);
        navigate("/App"); // Route to App.js
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask.");
    }
  };

  return (
    <div className="login-container">
      <button className="login-button" onClick={connectToMetaMask}>
        Connect to MetaMask
      </button>
    </div>
  );
};

export default Login;

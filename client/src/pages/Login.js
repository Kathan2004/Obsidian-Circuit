import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styling/login.css"; 

const Login = () => {
  const [account, setAccount] = useState(null); 
  const navigate = useNavigate();

  const connectToMetaMask = async () => {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length > 0) {
        setAccount(accounts[0]); 
        console.log("Connected account:", accounts[0]);
        navigate("/App"); 
      } else {
        alert("No account found in MetaMask.");
      }
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      alert("Failed to connect to MetaMask.");
    }
  };

  useEffect(() => {
    const checkAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts.length > 0) {
          setAccount(accounts[0]); 
          console.log("Already connected to account:", accounts[0]);
          navigate("/App"); 
        }
      }
    };

    checkAccount();
  }, [navigate]);

  return (
    <div className="login-container">
      <h2>Login to MetaMask</h2>
      {account ? (
        <p>Connected to: {account}</p> 
      ) : (
        <button className="login-button" onClick={connectToMetaMask}>
          Connect to MetaMask
        </button>
      )}
    </div>
  );
};

export default Login;

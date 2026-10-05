import React, { useState } from "react";
import Web3 from "web3";
import '../styling/form.css';
import { contractABI, contractAdd } from "../contracts/contract";
import { API_URL } from "../lib/api";

const Form = () => {
  const [formData, setFormData] = useState({
    file: null,
    fileHash: "",
    fileName: "",
    fileType: "",
    description: "",
  });

  // Pin through our API so Pinata credentials never ship in the browser bundle.
  const uploadToPinata = async (file) => {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${API_URL}/api/pin`, { method: "POST", body });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.cid) {
      throw new Error(data.error || "File upload to IPFS failed");
    }
    return data.cid;
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        file,
        fileName: file.name,
        fileType: file.type,
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { file, fileName, fileType, description } = formData;

    if (!file || !fileName || !fileType || !description) {
      alert("All fields are required!");
      return;
    }

    try {
      // Upload file to Pinata
      const fileHash = await uploadToPinata(file);

      // Ensure MetaMask is available
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      const contract = new web3.eth.Contract(contractABI, contractAdd);

      // Call contract to upload file information
      await contract.methods
        .uploadFile(fileHash, fileName, fileType, description)
        .send({ from: account });

      alert("File uploaded successfully!");
      setFormData({ file: null, fileHash: "", fileName: "", fileType: "", description: "" });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please try again.");
    }
  };

  return (
    <div className="form-container glassy-theme">
      <h2 className="form-title">Upload File</h2>
      <form onSubmit={handleSubmit}>
        {/* File Selection */}
        <div className="form-group">
          <label htmlFor="file">Select File</label>
          <input
            type="file"
            id="file"
            name="file"
            onChange={handleFileChange}
            required
            className="form-input"
          />
        </div>

        {/* File Hash */}
        <div className="form-group">
          <label htmlFor="fileHash">File Hash</label>
          <input
            type="text"
            id="fileHash"
            name="fileHash"
            value={formData.fileHash}
            onChange={handleChange}
            placeholder="File hash will be auto-filled after upload"
            required
            className="form-input"
            disabled
          />
        </div>

        {/* File Name */}
        <div className="form-group">
          <label htmlFor="fileName">File Name</label>
          <input
            type="text"
            id="fileName"
            name="fileName"
            value={formData.fileName}
            onChange={handleChange}
            placeholder="Enter file name"
            required
            className="form-input"
          />
        </div>

        {/* File Type */}
        <div className="form-group">
          <label htmlFor="fileType">File Type</label>
          <input
            type="text"
            id="fileType"
            name="fileType"
            value={formData.fileType}
            onChange={handleChange}
            placeholder="Enter file type (e.g., PDF, JPEG)"
            required
            className="form-input"
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter file description"
            required
            className="form-textarea"
          />
        </div>

        <button type="submit" className="form-button">
          Upload File
        </button>
      </form>
    </div>
  );
};

export default Form;

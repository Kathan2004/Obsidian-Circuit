import React, { useState } from "react";
import Web3 from "web3";
import '../styling/form.css';
import { contractABI, contractAdd } from "../contracts/contract";


const Form = () => {
  const [formData, setFormData] = useState({
    fileHash: "",
    fileName: "",
    fileType: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fileHash, fileName, fileType, description } = formData;

    if (!fileHash || !fileName || !fileType || !description) {
      alert("All fields are required!");
      return;
    }

    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed. Please install it to proceed.");
        return;
      }

      const web3 = new Web3(window.ethereum);
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const account = accounts[0];
      const contract = new web3.eth.Contract(contractABI, contractAdd);

      await contract.methods
        .uploadFile(fileHash, fileName, fileType, description)
        .send({ from: account });

      alert("File uploaded successfully!");
      setFormData({ fileHash: "", fileName: "", fileType: "", description: "" });
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload the file. Please try again.");
    }
  };

  return (
    <div className="form-container glassy-theme">
      <h2 className="form-title">Upload File</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fileHash">File Hash</label>
          <input
            type="text"
            id="fileHash"
            name="fileHash"
            value={formData.fileHash}
            onChange={handleChange}
            placeholder="Enter file hash"
            required
            className="form-input"
          />
        </div>

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

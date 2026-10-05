import React, { useState } from 'react';
import '../styling/NetwrokAnalysis.css'; // Import the corresponding CSS file
import { API_URL } from '../lib/api';

function NetworkAnalysis() {
  const [files, setFiles] = useState([]);
  const [networkLogs, setNetworkLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleFileUpload = async () => {
    if (!files.length) {
      setError('Please upload a PCAP file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', files[0]);

    try {
      const response = await fetch(`${API_URL}/api/analyze-network`, {  // Use the backend API URL
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setError('');
        setNetworkLogs(data.networkLogs || []);
        setSummary(data.summary || null);
        setSuspiciousActivity(data.suspiciousActivity);
      }
    } catch (err) {
      setError('Error uploading file: ' + err.message);
      console.error(err);
    }
  };

  return (
    <section id="network-analysis" className="glass">
      <h2>Network Analysis</h2>
      <div className="drop-area">
        <input
          type="file"
          accept=".pcap,.cap"
          onChange={handleFileChange}
          id="network-file-input"
        />
        <label htmlFor="network-file-input">
          <i className="fas fa-cloud-upload-alt"></i>
          <p>Drag and drop a PCAP file or click to browse</p>
        </label>
      </div>
      <button onClick={handleFileUpload}>Upload and Analyze</button>

      {error && <p className="error-message">{error}</p>}

      <div id="network-logs" className="glass">
        {summary && (
          <p>
            {summary.totalPackets} packets, {summary.decodedIPv4} IPv4 decoded
            {networkLogs.length < summary.decodedIPv4 ? ` (showing first ${networkLogs.length})` : ''}
          </p>
        )}
        {networkLogs.length > 0 ? (
          <table>
            <thead>
              <tr><th>Source</th><th>Destination</th><th>Proto</th><th>Flags</th><th>Bytes</th></tr>
            </thead>
            <tbody>
              {networkLogs.map((p, i) => (
                <tr key={i}>
                  <td>{p.src}{p.srcPort !== undefined ? `:${p.srcPort}` : ''}</td>
                  <td>{p.dst}{p.dstPort !== undefined ? `:${p.dstPort}` : ''}</td>
                  <td>{p.protocol}</td>
                  <td>{p.flags || ''}</td>
                  <td>{p.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No results yet. Upload a file to analyze.</p>
        )}
      </div>

      <div id="suspicious-activity" className="glass">
        {suspiciousActivity.length > 0 ? (
          <ul>
            {suspiciousActivity.map((item, index) => (
              <li key={index}>
                <strong>{item.type}</strong>: {item.details}
              </li>
            ))}
          </ul>
        ) : (
          <p>No suspicious activity detected.</p>
        )}
      </div>
    </section>
  );
}

export default NetworkAnalysis;

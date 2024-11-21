// /client/src/LogAnalysis.js

import React, { useState } from 'react';

function LogAnalysis() {
  const [logs, setLogs] = useState('');
  const [blockedLogs, setBlockedLogs] = useState([]);
  const [allowedLogs, setAllowedLogs] = useState([]);
  const [error, setError] = useState('');

  const handleLogsChange = (e) => {
    setLogs(e.target.value);  // Update the state with the new logs input
  };

  const handleAnalyzeLogs = async () => {
    if (logs.trim() === '') {
      setError('Please paste some logs to analyze.');
      return;
    }

    try {
      // Send logs to the backend (Node.js server, which calls the Python script)
      const response = await fetch('/api/analyze-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ logs: logs.split('\n') })  // Split logs by new lines
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setBlockedLogs(data.blockedLogs);
        setAllowedLogs(data.allowedLogs);
        setError('');
      }
    } catch (error) {
      setError('Error connecting to the server.');
    }
  };

  return (
    <section id="log-analysis">
      <h2>Log Analysis</h2>
      
      <textarea
        id="log-input"
        placeholder="Paste logs here"
        value={logs}
        onChange={handleLogsChange}  // Update logs state when the text area changes
      />
      <button id="analyze-logs" onClick={handleAnalyzeLogs}>
        Analyze
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div id="log-analysis-results">
        {/* Blocked Logs Table */}
        <h3>Blocked Logs</h3>
        {blockedLogs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {blockedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.timestamp}</td>
                  <td>{log.action}</td>
                  <td>{log.source_ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No blocked logs found.</p>
        )}

        {/* Allowed Logs Table */}
        <h3>Allowed Logs</h3>
        {allowedLogs.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {allowedLogs.map((log, index) => (
                <tr key={index}>
                  <td>{log.timestamp}</td>
                  <td>{log.action}</td>
                  <td>{log.source_ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No allowed logs found.</p>
        )}
      </div>
    </section>
  );
}

export default LogAnalysis;

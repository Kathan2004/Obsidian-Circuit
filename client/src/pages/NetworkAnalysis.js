import React, { useState } from 'react';

function NetworkAnalysis() {
  const [files, setFiles] = useState([]);
  const [analysisResult, setAnalysisResult] = useState('');
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
      const response = await fetch('http://localhost:5000/api/analyze-network', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setError('');
        setAnalysisResult(JSON.stringify(data.analysisResult, null, 2));
      }
    } catch (err) {
      setError('Error uploading file.');
      console.error(err);
    }
  };

  return (
    <section id="network-analysis">
      <h2>Network Analysis</h2>
      <input
        type="file"
        accept=".pcap,.pcapng"
        onChange={handleFileChange}
      />
      <button onClick={handleFileUpload}>Upload and Analyze</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div id="analysis-result">
        {analysisResult ? (
          <pre>{analysisResult}</pre>
        ) : (
          <p>No results yet. Upload a file to analyze.</p>
        )}
      </div>
    </section>
  );
}

export default NetworkAnalysis;

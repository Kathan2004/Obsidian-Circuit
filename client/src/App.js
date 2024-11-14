// /client/src/App.js

import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header>
        <div className="container">
          <h1>Obsidian Circuit</h1>
          <nav>
            <ul>
              <li><a href="#dashboard">Dashboard</a></li>
              <li><a href="#file-analysis">File Analysis</a></li>
              <li><a href="#network-analysis">Network Analysis</a></li>
              <li><a href="#log-analysis">Log Analysis</a></li>
              <li><a href="#reports">Reports</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <div className="container">
          <section id="dashboard">
            <h2>Dashboard</h2>
            <div className="grid">
              <div className="card">
                <h3>Recent Cases</h3>
                <ul>
                  <li>Case 1</li>
                  <li>Case 2</li>
                  <li>Case 3</li>
                </ul>
              </div>
              <div className="card">
                <h3>Threat Intelligence</h3>
                <div id="threat-intelligence-news"></div>
              </div>
              <div className="card">
                <h3>System Status</h3>
                <p>All systems operational.</p>
              </div>
            </div>
          </section>

          <section id="file-analysis">
            <h2>File Analysis</h2>
            <div className="glass">
              <div className="drop-area" 
                onClick={() => document.querySelector('#file-input').click()} 
                onDragOver={(e) => e.preventDefault()} 
                onDrop={(e) => handleDrop(e)}>
                <i className="fas fa-cloud-upload-alt"></i>
                <p>Drag and drop files here or click to upload</p>
                <input 
                  id="file-input" 
                  type="file" 
                  name="file" 
                  multiple 
                  style={{ display: 'none' }} 
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              <div id="file-list"></div>
            </div>
          </section>

          <section id="network-analysis">
            <h2>Network Analysis</h2>
            <div id="network-graph"></div>
          </section>

          <section id="log-analysis">
            <h2>Log Analysis</h2>
            <textarea id="log-input" placeholder="Paste logs here"></textarea>
            <button id="analyze-logs">Analyze</button>
            <div id="log-analysis-results"></div>
          </section>

          <section id="reports">
            <h2>Reports</h2>
            <p>Generate and manage investigation reports.</p>
          </section>
        </div>
      </main>

      <footer>
        <div className="container">
          <p>&copy; Obsidian Circuit</p>
        </div>
      </footer>
    </div>
  );
}

function handleDrop(event) {
  event.preventDefault();
  const files = event.dataTransfer.files;
  if (files.length) {
    handleFiles(files);
  }
}

function handleFiles(files) {
  const fileListDisplay = document.querySelector('#file-list');
  fileListDisplay.innerHTML = ''; // Clear previous file info
  Array.from(files).forEach(file => {
    const fileInfo = document.createElement('div');
    fileInfo.classList.add('file-info');
    fileInfo.innerHTML = `
      <p><strong>Name:</strong> ${file.name}</p>
      <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
      <p><strong>Last Modified:</strong> ${new Date(file.lastModified).toLocaleDateString()}</p>
    `;
    fileListDisplay.appendChild(fileInfo);
  });
}

export default App;

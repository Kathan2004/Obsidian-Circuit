// /client/src/App.js

import React from 'react';
import { Link } from 'react-router-dom';
import LogAnalysis from './LogAnalysis';  // Import the LogAnalysis component
import NetworkAnalysis from './NetworkAnalysis';  // Import the NetworkAnalysis component
import FileAnalysis from './FileAnalysis';  // Import the FileAnalysis component
import '../styling/Dashboard.css';

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
                <Link to="/History">                
                  <h3>History</h3>   
                </Link>                                 
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

          {/* File Analysis Section */}
          <FileAnalysis />  {/* This will render the FileAnalysis component */}

          <section id="network-analysis">
            <NetworkAnalysis />  {/* This will render the NetworkAnalysis component */}
          </section>

          <LogAnalysis />  {/* This will render the LogAnalysis component */}

          <section id="reports">
            <h2>Reports</h2>
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

export default App;

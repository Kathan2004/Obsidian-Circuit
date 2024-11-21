const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Route to analyze logs sent as plain text
app.post('/api/analyze-logs', (req, res) => {
  const logs = req.body.logs;  // Logs sent from the React frontend

  if (!logs || logs.trim() === '') {
    return res.status(400).json({ error: 'No logs provided' });
  }

  // Temporarily save logs to a file
  const fs = require('fs');
  const tempLogFilePath = path.resolve(__dirname, 'uploads', 'temp_logs.txt');
  fs.writeFileSync(tempLogFilePath, logs);

  // Call the Python script to process the logs
  const pythonScriptPath = path.resolve(__dirname, 'parse_logs.py');
  const command = `python "${pythonScriptPath}" "${tempLogFilePath}"`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error.message}`);
      return res.status(500).json({ error: `Error executing Python script: ${error.message}` });
    }

    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return res.status(500).json({ error: `stderr: ${stderr}` });
    }

    try {
      const analysisResult = JSON.parse(stdout);
      res.json({ analysisResult });
    } catch (err) {
      console.error('Error parsing Python output:', err);
      res.status(500).json({ error: 'Error parsing Python output' });
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

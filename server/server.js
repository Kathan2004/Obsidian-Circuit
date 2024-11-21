const express = require('express');
const multer = require('multer');
const pcapParser = require('pcap-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Setup multer for file upload
const upload = multer({ dest: 'uploads/' });

// Define POST route for file upload and analysis
app.post('/api/analyze-network', upload.single('file'), (req, res) => {
  const pcapFile = req.file.path;  // The file path uploaded
  const logs = [];
  const suspiciousActivity = [];

  // Use fs.createReadStream instead of fs.readFileSync
  const parser = pcapParser.parse(fs.createReadStream(pcapFile));

  parser.on('packet', (packet) => {
    logs.push(packet); // Store the packet data
    // Example: Detect suspicious activity (e.g., suspicious IP address or ports)
    if (packet.datalink && packet.datalink.includes('suspect')) {
      suspiciousActivity.push({
        type: 'Suspicious Packet',
        details: 'Suspicious packet detected: ${packet}',
      });
    }
  });

  parser.on('end', () => {
    res.json({
      networkLogs: logs,
      suspiciousActivity,
    });
  });

  parser.on('error', (err) => {
    console.error('Error parsing PCAP file:', err);
    res.status(500).json({ error: 'Error parsing PCAP file' });
  });
});

// Start the server
app.listen(1000, () => {
  console.log('Server running on http://localhost:1000');
});
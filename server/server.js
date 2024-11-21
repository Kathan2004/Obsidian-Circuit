const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 5000;

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Route to handle file uploads and extract metadata
app.post('/api/analyze-file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.resolve(req.file.path);
  const pythonScriptPath = path.resolve(__dirname, 'Metadata.py');

  // Call Python script to extract metadata
  exec(`python .\MetaData.py ${filePath}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Exec error: ${error.message}`);
      return res.status(500).json({ error: 'Error executing Python script' });
    }

    if (stderr) {
      console.error(`Stderr: ${stderr}`);
      return res.status(500).json({ error: 'Error in Python script' });
    }

    try {
      const metadata = JSON.parse(stdout);
      res.json({ metadata });
      console.log(metadata);
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

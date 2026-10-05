/**
 * Obsidian Circuit API.
 *   POST /api/analyze-network  PCAP triage (decoded flows + heuristics)
 *   POST /api/analyze-file     hashes and metadata for evidence files
 *   POST /api/pin              pin evidence to IPFS via Pinata (keys stay server-side)
 */
require('dotenv').config();
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const pcapParser = require('pcap-parser');
const { decode, analyse } = require('./lib/packets');

const PORT = Number(process.env.PORT || 1000);
const HOST = process.env.HOST || '127.0.0.1';
const CLIENT_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim());
const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 50);
const MAX_PACKETS_RETURNED = 500;

const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: CLIENT_ORIGIN }));

const diskUpload = multer({ dest: path.join(os.tmpdir(), 'obsidian-uploads'), limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 20 } });
const memUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_UPLOAD_MB * 1024 * 1024, files: 1 } });

const removeQuietly = (p) => fs.promises.unlink(p).catch(() => {});

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/api/analyze-network', diskUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No PCAP file uploaded' });
  const records = [];
  let total = 0;
  let linkType = 1;
  let validHeader = false;
  const fail = () => {
    if (!res.headersSent) res.status(400).json({ error: 'Not a valid libpcap file (pcapng is not supported)' });
  };
  const parser = pcapParser.parse(fs.createReadStream(req.file.path));
  parser.on('globalHeader', (h) => { validHeader = true; linkType = h.linkLayerType; });
  parser.on('packet', (packet) => {
    total += 1;
    const rec = decode(packet, linkType);
    if (rec) records.push(rec);
  });
  parser.on('end', () => {
    removeQuietly(req.file.path);
    if (!validHeader) return fail();
    if (res.headersSent) return;
    res.json({
      summary: { totalPackets: total, decodedIPv4: records.length, linkType },
      networkLogs: records.slice(0, MAX_PACKETS_RETURNED),
      truncated: records.length > MAX_PACKETS_RETURNED,
      suspiciousActivity: analyse(records),
    });
  });
  parser.on('error', (err) => {
    removeQuietly(req.file.path);
    console.error('PCAP parse error:', err.message);
    fail();
  });
});

async function hashFile(file) {
  const md5 = crypto.createHash('md5');
  const sha1 = crypto.createHash('sha1');
  const sha256 = crypto.createHash('sha256');
  for await (const chunk of fs.createReadStream(file.path)) {
    md5.update(chunk); sha1.update(chunk); sha256.update(chunk);
  }
  return {
    name: path.basename(file.originalname),
    size: (file.size / 1024).toFixed(2) + ' KB',
    lastModified: new Date().toLocaleDateString(),
    fileType: file.mimetype,
    md5Hash: md5.digest('hex'),
    sha1Hash: sha1.digest('hex'),
    sha256Hash: sha256.digest('hex'),
  };
}

app.post('/api/analyze-file', diskUpload.array('file', 20), async (req, res) => {
  const files = req.files || [];
  if (!files.length) return res.status(400).json({ error: 'No files uploaded' });
  try {
    res.json({ metadata: await Promise.all(files.map(hashFile)) });
  } catch (err) {
    console.error('Hashing failed:', err.message);
    res.status(500).json({ error: 'Failed to analyse files' });
  } finally {
    files.forEach((f) => removeQuietly(f.path));
  }
});

app.post('/api/pin', memUpload.single('file'), async (req, res) => {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) return res.status(503).json({ error: 'Pinning is not configured (set PINATA_JWT)' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const form = new FormData();
    form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), path.basename(req.file.originalname));
    const r = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok || !body.IpfsHash) return res.status(502).json({ error: 'Pinata rejected the upload' });
    res.json({ cid: body.IpfsHash, sha256: crypto.createHash('sha256').update(req.file.buffer).digest('hex') });
  } catch (err) {
    console.error('Pinata error:', err.message);
    res.status(502).json({ error: 'Pinning failed' });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) return res.status(413).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Internal error' });
});

if (require.main === module) {
  app.listen(PORT, HOST, () => console.log(`Obsidian Circuit API on http://${HOST}:${PORT}`));
}

module.exports = app;

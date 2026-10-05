const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const app = require('../server');

let server;
let base;
before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

function tcpFrame(src, dst, sport, dport) {
  const eth = Buffer.alloc(14);
  eth.writeUInt16BE(0x0800, 12);
  const ip = Buffer.alloc(20);
  ip[0] = 0x45; ip[9] = 6;
  src.split('.').forEach((o, i) => { ip[12 + i] = Number(o); });
  dst.split('.').forEach((o, i) => { ip[16 + i] = Number(o); });
  const tcp = Buffer.alloc(20);
  tcp.writeUInt16BE(sport, 0); tcp.writeUInt16BE(dport, 2); tcp[13] = 0x02; // SYN
  return Buffer.concat([eth, ip, tcp]);
}

function pcap(frames) {
  const gh = Buffer.alloc(24);
  gh.writeUInt32LE(0xa1b2c3d4, 0); gh.writeUInt16LE(2, 4); gh.writeUInt16LE(4, 6);
  gh.writeUInt32LE(65535, 16); gh.writeUInt32LE(1, 20);
  const recs = frames.map((f, i) => {
    const h = Buffer.alloc(16);
    h.writeUInt32LE(1700000000 + i, 0); h.writeUInt32LE(f.length, 8); h.writeUInt32LE(f.length, 12);
    return Buffer.concat([h, f]);
  });
  return Buffer.concat([gh, ...recs]);
}

async function upload(path, buf, name) {
  const form = new FormData();
  form.append('file', new Blob([buf]), name);
  const r = await fetch(base + path, { method: 'POST', body: form });
  return { status: r.status, body: await r.json() };
}

test('PCAP: decodes flows, flags backdoor port and port scan', async () => {
  const frames = [tcpFrame('10.0.0.5', '10.0.0.9', 50000, 4444)];
  for (let p = 1; p <= 25; p++) frames.push(tcpFrame('10.0.0.66', '10.0.0.9', 40000, p));
  const { status, body } = await upload('/api/analyze-network', pcap(frames), 't.pcap');
  assert.equal(status, 200);
  assert.equal(body.summary.totalPackets, 26);
  assert.equal(body.networkLogs[0].dstPort, 4444);
  assert.equal(body.networkLogs[0].flags, 'SYN');
  const types = body.suspiciousActivity.map((f) => f.type);
  assert.ok(types.includes('Suspicious Port'));
  assert.ok(types.includes('Port Scan'));
});

test('PCAP: garbage is rejected cleanly', async () => {
  const { status } = await upload('/api/analyze-network', Buffer.from('not a pcap at all......'), 'x.pcap');
  assert.equal(status, 400);
});

test('file analysis returns hashes', async () => {
  const data = Buffer.from('evidence');
  const { status, body } = await upload('/api/analyze-file', data, '../../etc/passwd');
  assert.equal(status, 200);
  assert.equal(body.metadata[0].sha256Hash, crypto.createHash('sha256').update(data).digest('hex'));
  assert.equal(body.metadata[0].name, 'passwd');
});

test('pinning is disabled without server-side credentials', async () => {
  delete process.env.PINATA_JWT;
  const { status } = await upload('/api/pin', Buffer.from('x'), 'x.txt');
  assert.equal(status, 503);
});

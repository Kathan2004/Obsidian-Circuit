// Minimal Ethernet/IPv4/TCP/UDP decoding and heuristics for PCAP triage.

const SUSPICIOUS_PORTS = new Map([
  [23, 'Telnet (cleartext remote shell)'],
  [4444, 'Metasploit default handler'],
  [1337, 'Common backdoor port'],
  [31337, 'Back Orifice / elite backdoor'],
  [6667, 'IRC (botnet C2)'],
  [5555, 'ADB over network'],
  [3389, 'RDP exposed'],
  [445, 'SMB'],
]);
const SCAN_PORT_THRESHOLD = 20;

function ipv4(buf, off) {
  return `${buf[off]}.${buf[off + 1]}.${buf[off + 2]}.${buf[off + 3]}`;
}

/** Decode one libpcap record. Returns null for non-IPv4 frames. */
function decode(packet, linkType = 1) {
  const data = packet.data;
  if (!Buffer.isBuffer(data)) return null;
  let off = 0;
  if (linkType === 1) {
    if (data.length < 14) return null;
    let etherType = data.readUInt16BE(12);
    off = 14;
    if (etherType === 0x8100 && data.length >= 18) {
      etherType = data.readUInt16BE(16);
      off = 18;
    }
    if (etherType !== 0x0800) return null;
  } else if (linkType !== 101) {
    return null; // only Ethernet and raw IP
  }
  if (data.length < off + 20 || data[off] >> 4 !== 4) return null;
  const ihl = (data[off] & 0x0f) * 4;
  const proto = data[off + 9];
  const rec = {
    ts: packet.header ? packet.header.timestampSeconds : undefined,
    length: packet.header ? packet.header.originalLength : data.length,
    src: ipv4(data, off + 12),
    dst: ipv4(data, off + 16),
    protocol: proto === 6 ? 'TCP' : proto === 17 ? 'UDP' : proto === 1 ? 'ICMP' : String(proto),
  };
  const l4 = off + ihl;
  if ((proto === 6 || proto === 17) && data.length >= l4 + 4) {
    rec.srcPort = data.readUInt16BE(l4);
    rec.dstPort = data.readUInt16BE(l4 + 2);
    if (proto === 6 && data.length >= l4 + 14) {
      const f = data[l4 + 13];
      rec.flags = ['FIN', 'SYN', 'RST', 'PSH', 'ACK', 'URG'].filter((_, i) => f & (1 << i)).join(',');
    }
  }
  return rec;
}

/** Aggregate decoded packets into findings. */
function analyse(records) {
  const findings = [];
  const portsBySrc = new Map();
  const seen = new Set();
  for (const r of records) {
    if (r.dstPort !== undefined) {
      if (!portsBySrc.has(r.src)) portsBySrc.set(r.src, new Map());
      const dsts = portsBySrc.get(r.src);
      if (!dsts.has(r.dst)) dsts.set(r.dst, new Set());
      dsts.get(r.dst).add(r.dstPort);
      const reason = SUSPICIOUS_PORTS.get(r.dstPort);
      const key = `${r.src}>${r.dst}:${r.dstPort}`;
      if (reason && !seen.has(key)) {
        seen.add(key);
        findings.push({ type: 'Suspicious Port', details: `${r.src} -> ${r.dst}:${r.dstPort} (${reason})` });
      }
    }
  }
  for (const [src, dsts] of portsBySrc) {
    for (const [dst, ports] of dsts) {
      if (ports.size >= SCAN_PORT_THRESHOLD) {
        findings.push({ type: 'Port Scan', details: `${src} probed ${ports.size} ports on ${dst}` });
      }
    }
  }
  return findings;
}

module.exports = { decode, analyse, SUSPICIOUS_PORTS, SCAN_PORT_THRESHOLD };

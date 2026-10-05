# Obsidian Circuit

Digital forensics workbench with blockchain-anchored evidence. Analysts triage packet captures, logs and files, then register evidence on IPFS and an Ethereum contract. The contract record gives a tamper-evident chain of custody: who submitted what, and when.

```
React client ──► Node API (server/) ──► PCAP decoding + heuristics
     │                 ├──► file hashing (MD5 / SHA-1 / SHA-256)
     │                 └──► Pinata (IPFS pinning, credentials server-side)
     └──► MetaMask ──► DecentralizedFileStorage contract (CID, name, type, uploader, timestamp)
```

## Modules

| Page | What it does |
|---|---|
| Dashboard | Entry point for the analysis modules |
| Network Analysis | Upload a libpcap capture; the server decodes Ethernet/IPv4/TCP/UDP and flags backdoor/C2 ports (4444, 1337, 31337, 6667, Telnet ...) and port scans (one source probing 20 or more ports on a host) |
| Log Analysis | Parse and filter log files in the browser |
| File Analysis | MD5 / SHA-1 / SHA-256 and metadata for evidence files |
| Evidence form | Pin a file to IPFS, then record its CID on-chain via MetaMask |
| History | Read evidence records back from the contract |
| Report | Export findings to PDF |

## Run

```bash
# API
cd server
cp .env.example .env          # PINATA_JWT for evidence pinning (optional)
npm ci && npm start           # http://127.0.0.1:1000

# Client
cd ../client
npm ci && npm start           # http://localhost:3000 (REACT_APP_API_URL to point elsewhere)
```

A sample capture is in `docs/samples/sample.pcap`.

## Security notes

- **Pinata credentials.** These live only in the API (`PINATA_JWT`). The original fork shipped a Pinata key and secret in the React bundle; they were purged from history and must be rotated.
- **API exposure.** The API binds to `127.0.0.1`, restricts CORS to `CLIENT_ORIGIN`, caps upload size, stores uploads in a temp directory and deletes them after analysis.
- **Write-once evidence.** The contract rejects re-registering an existing hash, so the original uploader and timestamp cannot be overwritten. Contracts deployed from earlier source do not have this check; redeploy and update `client/src/contracts/contract.js`.

## Development

```bash
cd server && npm test        # PCAP decoding, heuristics, hashing, pin guard
cd client && npm run build
```

## Credits

Forked from the original Obsidian Circuit project; extended by [@Kathan2004](https://github.com/Kathan2004). Project report and slides are in `docs/report/`.

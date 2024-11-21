import pyshark
import sys
import json

# Known indicators for Emotet infection
KNOWN_MALICIOUS_IPS = ["192.168.1.100", "8.8.8.8"]
KNOWN_MALICIOUS_DOMAINS = ["malicious-emotet.com", "c2-emotet.com"]
KNOWN_MALICIOUS_PORTS = [8080, 443]  # Common for C2 traffic

def analyze_pcap(file_path):
    cap = pyshark.FileCapture(file_path)
    analysis_result = {
        "total_packets": 0,
        "suspicious_dns_requests": [],
        "malicious_ip_traffic": [],
        "unusual_ports": [],
    }

    for packet in cap:
        analysis_result["total_packets"] += 1

        # Check DNS traffic for malicious domains
        if 'DNS' in packet:
            dns_query = packet.dns.qry_name
            if dns_query in KNOWN_MALICIOUS_DOMAINS:
                analysis_result["suspicious_dns_requests"].append({
                    "timestamp": packet.sniff_time.isoformat(),
                    "domain": dns_query,
                    "source_ip": packet.ip.src
                })

        # Check IP traffic for malicious connections
        if 'IP' in packet:
            src_ip = packet.ip.src
            dst_ip = packet.ip.dst
            if dst_ip in KNOWN_MALICIOUS_IPS:
                analysis_result["malicious_ip_traffic"].append({
                    "timestamp": packet.sniff_time.isoformat(),
                    "source_ip": src_ip,
                    "destination_ip": dst_ip
                })

        # Check for traffic on unusual ports
        if 'TCP' in packet or 'UDP' in packet:
            port = int(packet[packet.transport_layer].dstport)
            if port in KNOWN_MALICIOUS_PORTS:
                analysis_result["unusual_ports"].append({
                    "timestamp": packet.sniff_time.isoformat(),
                    "port": port,
                    "source_ip": packet.ip.src,
                    "destination_ip": packet.ip.dst
                })

    cap.close()
    return analysis_result

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_pcap.py <pcap_file>")
        sys.exit(1)

    file_path = sys.argv[1]
    try:
        result = analyze_pcap(file_path)
        print(json.dumps(result, indent=4))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

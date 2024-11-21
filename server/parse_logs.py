import sys
import json
import pandas as pd
import re

# Log Parsing Function
def parse_firewall_logs(logs):
    parsed_logs = []
    for log in logs:
        # Parsing firewall logs
        pattern = r"(?P<timestamp>\d+-\d+-\d+ \d+:\d+:\d+) Action=(?P<action>\w+) SourceIP=(?P<source_ip>[\d.]+)"
        match = re.search(pattern, log)
        if match:
            parsed_logs.append(match.groupdict())
    return pd.DataFrame(parsed_logs)

# Read logs from stdin (passed from Node.js)
logs = json.loads(sys.stdin.read())

# Parse the logs
parsed_logs_df = parse_firewall_logs(logs)

# Convert timestamps to datetime for easier analysis
parsed_logs_df["timestamp"] = pd.to_datetime(parsed_logs_df["timestamp"])

# Separate blocked and allowed logs
blocked_logs_df = parsed_logs_df[parsed_logs_df['action'] == 'block']
allowed_logs_df = parsed_logs_df[parsed_logs_df['action'] == 'allow']

# Convert both blocked and allowed logs to JSON
blocked_logs_json = blocked_logs_df.to_dict(orient='records')
allowed_logs_json = allowed_logs_df.to_dict(orient='records')

# Convert timestamps to string format (ISO format) before serializing to JSON
for log in blocked_logs_json + allowed_logs_json:
    log['timestamp'] = log['timestamp'].isoformat()  # Convert pandas Timestamp to string

# Output the result in JSON format
result = {
    'blockedLogs': blocked_logs_json,
    'allowedLogs': allowed_logs_json
}

print(json.dumps(result))  # Print the result

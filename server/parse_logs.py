import sys
import json
import re

def analyze_logs(file_path):
    try:
        with open(file_path, 'r') as file:
            logs = file.readlines()

        analysis_result = {
            "safe_logs": [],
            "suspicious_logs": []
        }

        # Define log patterns (you can modify these based on your use case)
        failed_login_pattern = r"Failed login attempt from (?P<ip>\d+\.\d+\.\d+\.\d+)"
        success_login_pattern = r"Successful login from (?P<ip>\d+\.\d+\.\d+\.\d+)"
        suspicious_activity_pattern = r"Suspicious activity detected from (?P<ip>\d+\.\d+\.\d+\.\d+)"

        # Analyzing the logs for specific patterns
        for log in logs:
            failed_match = re.search(failed_login_pattern, log)
            success_match = re.search(success_login_pattern, log)
            suspicious_match = re.search(suspicious_activity_pattern, log)

            if failed_match or suspicious_match:
                # If failed login or suspicious activity, classify as suspicious
                analysis_result["suspicious_logs"].append(log.strip())
            elif success_match:
                # Successful login is classified as safe
                analysis_result["safe_logs"].append(log.strip())

        return analysis_result
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python parse_logs.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    result = analyze_logs(file_path)
    print(json.dumps(result, indent=4))  # Output result as JSON

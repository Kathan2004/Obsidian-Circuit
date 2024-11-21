import os
import hashlib
import magic
import json

def calculate_hashes(file_path):
    """Calculate MD5, SHA-1, and SHA-256 hashes for a given file."""
    md5_hash = hashlib.md5()
    sha1_hash = hashlib.sha1()
    sha256_hash = hashlib.sha256()

    try:
        with open(file_path, "rb") as f:
            while chunk := f.read(4096):  # Read in 4KB chunks
                md5_hash.update(chunk)
                sha1_hash.update(chunk)
                sha256_hash.update(chunk)
        return {
            "md5Hash": md5_hash.hexdigest(),
            "sha1Hash": sha1_hash.hexdigest(),
            "sha256Hash": sha256_hash.hexdigest()
        }
    except Exception as e:
        return {"error": f"Error calculating hashes: {str(e)}"}

def get_file_metadata(file_path):
    """Extract metadata for a given file."""
    try:
        # Get basic file details
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        last_modified = os.path.getmtime(file_path)

        # Detect MIME type using python-magic
        mime = magic.Magic(mime=True)
        file_type = mime.from_file(file_path)

        # Calculate file hashes
        hashes = calculate_hashes(file_path)

        # Construct metadata dictionary
        metadata = {
            "fileName": file_name,
            "fileSize": file_size,
            "lastModified": last_modified,
            "fileType": file_type,
            **hashes  # Include hash results in the metadata
        }

        # Print metadata to console for debugging purposes
        print(json.dumps(metadata, indent=4))

        return metadata

    except Exception as e:
        return {"error": f"Error extracting metadata: {str(e)}"}

# Test the function (for development purposes)
if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python Metadata.py <file_path>")
        sys.exit(1)

    file_path = sys.argv[1]
    metadata = get_file_metadata(file_path)
    print(json.dumps(metadata, indent=4))

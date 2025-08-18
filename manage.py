from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import PyPDF2
import re
import os
import webbrowser

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

@app.route('/extract_metadata', methods=['POST'])
def extract_metadata():
    try:
        file = request.files['file']
        
        # Read PDF
        reader = PyPDF2.PdfReader(file)
        info = reader.metadata or {}

        # Extract fields safely
        title = info.get("/Title", "") or ""
        authors = info.get("/Author", "") or ""
        journal = info.get("/Creator", "") or ""
        keywords = info.get("/Keywords", "") or ""

        # Extract year
        year = ""
        if "/doi" in info:
            match = re.search(r"(19|20)\d{2}", info["/doi"])
            if match:
                year = match.group(0)
        elif "/ModDate" in info:
            match = re.search(r"(19|20)\d{2}", info["/ModDate"])
            if match:
                year = match.group(0)

        metadata = {
            "title": title,
            "authors": authors,
            "year": year,
            "journal": journal,
            "keywords": keywords
        }

        if not any(metadata.values()):
            return jsonify({"error": "Unable to fetch metadata, please fill manually"}), 200

        return jsonify(metadata)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Serve index.html directly
@app.route("/")
def index():
    return send_from_directory(os.getcwd(), "index.html")


if __name__ == "__main__":
    port = 5000
    url = f"http://localhost:{port}/"
    webbrowser.open(url)  # auto-open browser
    app.run(host="0.0.0.0", port=port, debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
import re

app = Flask(__name__)
CORS(app)

@app.route('/extract_metadata', methods=['POST'])
def extract_metadata():
    try:
        file = request.files['file']
        
        # Read PDF
        reader = PyPDF2.PdfReader(file)
        info = reader.metadata or {}

        # Extract fields safely
        title = info.get("/Title", "") if info.get("/Title") else ""
        authors = info.get("/Author", "") if info.get("/Author") else ""
        journal = info.get("/Creator", "") if info.get("/Creator") else ""
        keywords = info.get("/Keywords", "") if info.get("/Keywords") else ""

        # Extract year (try from DOI or ModDate)
        year = ""
        if "/doi" in info:
            match = re.search(r"(19|20)\d{2}", info["/doi"])
            if match:
                year = match.group(0)
        elif "/ModDate" in info:
            match = re.search(r"(19|20)\d{2}", info["/ModDate"])
            if match:
                year = match.group(0)

        # Prepare response
        metadata = {
            "title": title,
            "authors": authors,
            "year": year,
            "journal": journal,
            "keywords": keywords
        }

        # Check if everything is blank
        if not any(metadata.values()):
            return jsonify({"error": "Unable to fetch metadata, please fill manually"}), 200

        return jsonify(metadata)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)

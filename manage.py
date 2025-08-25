from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import PyPDF2
import re
import os
import webbrowser
import google.generativeai as genai
import time
import requests

# Set a dummy API key for the environment. This will be replaced in Canvas.
# This ensures the code can be run locally.
genai.configure(api_key="AIzaSyBgU7Y5hxRKceW2P8YWBY3WSt96RX0ZzdQ")

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)

@app.route('/extract_metadata', methods=['POST'])
def extract_metadata():
    """Extracts metadata from a PDF file using PyPDF2."""
    try:
        file = request.files['file']
        
        reader = PyPDF2.PdfReader(file)
        info = reader.metadata or {}

        title = info.get("/Title", "") or ""
        authors = info.get("/Author", "") or ""
        journal = info.get("/Creator", "") or ""
        keywords = info.get("/Keywords", "") or ""

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

@app.route('/api/gemini-chat', methods=['POST'])
def gemini_chat():
    """
    Handles POST requests for the chatbot.
    Sends user message to Gemini API and returns the response.
    """
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        # Simple backoff logic for retries
        retries = 0
        while retries < 3:
            try:
                model = genai.GenerativeModel('gemini-2.5-flash-preview-05-20')
                response = model.generate_content(user_message)
                return jsonify({'reply': response.text})
            except Exception as e:
                print(f"Error communicating with Gemini API: {e}")
                retries += 1
                time.sleep(2 ** retries) # Exponential backoff
        
        return jsonify({'reply': "Sorry, I'm unable to connect to the AI service right now."}), 500
    
    except Exception as e:
        return jsonify({"reply": f"An internal server error occurred: {str(e)}"}), 500


@app.route("/")
def index():
    """Serves the index.html file."""
    return send_from_directory(os.getcwd(), "index.html")


if __name__ == "__main__":
    port = 5000
    url = f"http://localhost:{port}/"
    webbrowser.open(url)
    app.run(host="0.0.0.0", port=port, debug=True)

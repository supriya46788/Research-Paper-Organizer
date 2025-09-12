from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import fitz  # PyMuPDF
import os
import webbrowser
import PyPDF2
import re
from collections import Counter
import google.generativeai as genai

# -----------------------------
# Load Gemini API Key
# -----------------------------
GEMINI_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_KEY:
    print("❌ Gemini API key not found! Set it with: setx GEMINI_API_KEY \"your_key_here\"")
else:
    print("✅ Gemini API key loaded")
    genai.configure(api_key=GEMINI_KEY)

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app, resources={r"/*": {"origins": "*"}})

pdf_text_context = ""  # store extracted PDF text globally

# -----------------------------
# Helper functions
# -----------------------------
def extract_text_from_pdf(file):
    text = ""
    pdf_document = fitz.open(stream=file.read(), filetype="pdf")
    for page in pdf_document:
        text += page.get_text()
    return text

def generate_summary(text):
    return text[:900] + "..." if len(text) > 900 else text

def extract_keywords(text, top_n=5):
    words = re.findall(r'\b\w+\b', text.lower())
    common = Counter(w for w in words if len(w) > 4).most_common(top_n)
    return [{"word": w, "count": c} for w, c in common]

# -----------------------------
# Routes
# -----------------------------
@app.route('/summarize', methods=['POST'])
def summarize():
    global pdf_text_context
    try:
        file = request.files['file']
        reader = PyPDF2.PdfReader(file)
        text = "".join([p.extract_text() or "" for p in reader.pages])
        pdf_text_context = text

        summary = generate_summary(text)
        keywords = extract_keywords(text)

        return jsonify({"summary": summary, "keywords": keywords, "full_text": text})
    except Exception as e:
        print("Error in /summarize:", e)
        return jsonify({"error": str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    global pdf_text_context
    data = request.get_json()
    user_message = data.get("message", "")

    if not pdf_text_context:
        return jsonify({"error": "No PDF context available. Upload a PDF first."}), 400
    if not GEMINI_KEY:
        return jsonify({"error": "Gemini API key not configured!"}), 500

    try:
        prompt = f"""
        You are an AI research assistant. Use the following content to answer the question.

        Content:
        {pdf_text_context[:3000]}

        Question: {user_message}
        """

        model= genai.GenerativeModel("gemini-2.5-flash")

        response = model.generate_content(prompt)

        ai_response = getattr(response, "text", None)
        if not ai_response:
            return jsonify({"response": "⚠️ Gemini returned no text. Check logs for details."})

        return jsonify({"response": ai_response})
    except Exception as e:
        print("Error in /chat:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/")
def index():
    return send_from_directory(os.getcwd(), "index.html")

# -----------------------------
# Run the app
# -----------------------------
if __name__ == "__main__":
    port = 5000
    url = f"http://localhost:{port}/"
    webbrowser.open(url)
    app.run(host="0.0.0.0", port=port, debug=True)

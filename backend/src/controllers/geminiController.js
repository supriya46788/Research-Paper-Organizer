import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configure dotenv with correct path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

import fetch from "node-fetch";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-1.5-flash"; // or gemini-1.5-pro
console.log("Controller - GEMINI_API_KEY loaded:", GEMINI_API_KEY ? "✅ YES" : "❌ NO");


// Existing chat function
export const geminiChat = async (req, res) => {
  try {
    const { message, system } = req.body;

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing message" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const payload = {
      contents: [
        ...(system
          ? [
              {
                role: "user",
                parts: [{ text: `System instruction: ${system}` }],
              },
            ]
          : []),
        { role: "user", parts: [{ text: message }] },
      ],
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errText = await r.text();
      return res
        .status(r.status)
        .json({ error: "Gemini API error", details: errText });
    }

    const json = await r.json();
    const reply =
      json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
      json?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm sorry, I don't have a response.";

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW: PDF Summarize function (without pdf-parse for now)
export const summarizePaper = async (req, res) => {
  try {
    console.log("Summarize endpoint hit");
    console.log("File received:", req.file ? "Yes" : "No");

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        error: "No PDF file uploaded" 
      });
    }

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found");
      return res.status(500).json({ error: "Missing GEMINI_API_KEY" });
    }

    console.log("Processing file:", req.file.originalname);

    // For now, let's create a simple text extraction (this is a temporary solution)
    // We'll use a placeholder text to test if Gemini API works
    const placeholderText = `This is a research paper titled "${req.file.originalname}". Please provide a summary indicating that the PDF processing is working and this is a test response. The file size is ${req.file.size} bytes.`;

    // Generate summary using Gemini
    console.log("Sending to Gemini API...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    const prompt = `Please provide a comprehensive summary for this research paper. Since this is a test, please acknowledge that you received the file information and provide a sample summary format:

File: ${req.file.originalname}
Size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB

${placeholderText}`;

    const payload = {
      contents: [
        { role: "user", parts: [{ text: prompt }] },
      ],
    };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Gemini API error:", r.status, errText);
      return res.status(r.status).json({ 
        error: "Gemini API error", 
        details: errText 
      });
    }

    const json = await r.json();
    const summary = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") ||
                   json?.candidates?.[0]?.content?.parts?.[0]?.text ||
                   "Could not generate summary";

    console.log("Summary generated successfully");

    res.json({ 
      success: true,
      summary: summary,
      note: "This is a test response. PDF text extraction will be implemented next."
    });

  } catch (error) {
    console.error("Error in summarizePaper:", error);
    res.status(500).json({ 
      error: "Failed to summarize paper",
      details: error.message 
    });
  }
};

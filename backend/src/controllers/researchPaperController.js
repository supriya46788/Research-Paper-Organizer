import ResearchPaper from "../models/researchPaper.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const createPaper = async (req, res) => {
  try {
    const researchPaper = await ResearchPaper.create({ ...req.body });
    res.status(201).json(researchPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPapers = async (req, res) => {
  try {
    const researchPapers = await ResearchPaper.find();
    res.json(researchPapers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPaper = async (req, res) => {
  try {
    const researchPaper = await ResearchPaper.findById(req.params.id);
    if (!researchPaper)
      return res.status(404).json({ message: "ResearchPaper not found" });
    res.json(researchPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updatePaper = async (req, res) => {
  try {
    const researchPaper = await ResearchPaper.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!researchPaper)
      return res.status(404).json({ message: "ResearchPaper not found" });
    res.json(researchPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deletePaper = async (req, res) => {
  try {
    const researchPaper = await ResearchPaper.findByIdAndDelete(req.params.id);
    if (!researchPaper)
      return res.status(404).json({ message: "ResearchPaper not found" });
    res.json({ message: "ResearchPaper deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const saveAnnotations = async (req, res) => {
  try {
    const { id } = req.params;
    const { annotations } = req.body;
    const researchPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      { annotations },
      { new: true }
    );
    if (!researchPaper)
      return res.status(404).json({ message: "ResearchPaper not found" });
    res.json(researchPaper);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const suggestTags = async (req, res) => {
  try {
    const { title, abstract } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const GEMINI_MODEL = "gemini-1.5-flash";
    if (!GEMINI_API_KEY) {
      return res.status(500).json({ message: "Missing GEMINI_API_KEY" });
    }
    const prompt = `Suggest 5 relevant tags (single words or short phrases, comma-separated, no explanations) for a research paper with the following title and abstract.\nTitle: ${title}\nAbstract: ${abstract}`;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    let tags = [];
    if (data && data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      tags = data.candidates[0].content.parts[0].text
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    res.json({ suggestedTags: tags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export { createPaper, getPaper, getPapers, updatePaper, deletePaper, saveAnnotations, suggestTags };
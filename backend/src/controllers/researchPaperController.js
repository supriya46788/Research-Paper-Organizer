import ResearchPaper from "../models/researchPaper.js";

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
    // Placeholder: Replace with actual NLP or external API integration
    const keywords = [];
    if (title) keywords.push(...title.split(" ").slice(0, 3));
    if (abstract) keywords.push(...abstract.split(" ").slice(0, 3));
    const tags = Array.from(new Set(keywords.map(k => k.toLowerCase())));
    res.json({ suggestedTags: tags });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
export { createPaper, getPaper, getPapers, updatePaper, deletePaper, saveAnnotations, suggestTags };
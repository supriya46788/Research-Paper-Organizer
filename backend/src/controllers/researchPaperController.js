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

export { createPaper, getPaper, getPapers, updatePaper, deletePaper };

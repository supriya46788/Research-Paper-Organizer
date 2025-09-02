import mongoose from "mongoose";

const researchPaperSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: { type: String, required: true, trim: true },
    year: { type: String },
    journal: { type: String },
    url: { type: String },
    topic: {
      type: String,
      enum: ["Machine Learning", "Data Science", "Web Development"],
    },
    notes: { type: String },
    tags: { type: [String] },
    abstract: { type: String },
    dateAdded: { type: Date },
    pdfData: { type: Buffer },
    rating: { type: Number, min: 0, max: 5 },
    isFavorite: { type: Boolean, default: false },
    cloudProvider: { type: String },
    cloudFileUrl: { type: String },
    annotations: { type: Object },
  },
  {
    timestamps: true,
  }
);

const ResearchPaper = mongoose.model("ResearchPaper", researchPaperSchema);

export default ResearchPaper;
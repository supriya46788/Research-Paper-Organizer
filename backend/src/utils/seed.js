import ResearchPaper from "../models/researchPaper.js";
import { connectDB } from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const initialResearchPapers = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
    year: "2017",
    journal: "NIPS",
    url: "https://arxiv.org/abs/1706.03762",
    topic: "Machine Learning",
    notes:
      "Introduced the Transformer architecture that revolutionized NLP. Key insight: self-attention mechanism can replace recurrence and convolution.",
    tags: ["transformers", "attention", "nlp"],
    abstract:
      "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms.",
    dateAdded: "2024-01-15",
    pdfData: null,
    rating: 0,
    isFavorite: false,
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: "Devlin, J., Chang, M. W., Lee, K., Toutanova, K.",
    year: "2018",
    journal: "NAACL",
    url: "https://arxiv.org/abs/1810.04805",
    topic: "Machine Learning",
    notes:
      "BERT showed that bidirectional pre-training is crucial for language understanding tasks.",
    tags: ["bert", "pre-training", "bidirectional"],
    abstract:
      "We introduce BERT, which stands for Bidirectional Encoder Representations from Transformers. BERT is designed to pre-train deep bidirectional representations.",
    dateAdded: "2024-01-20",
    pdfData: null,
    rating: 1,
    isFavorite: false,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await ResearchPaper.insertMany(initialResearchPapers);
    console.log("✅ Database seed operation was successful");
    process.exit(1);
  } catch (error) {
    console.log("❌ Failed to seed database");
    console.log(error.message);
  }
};

seedDatabase();

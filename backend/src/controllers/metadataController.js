import axios from "axios";
import pdfParse from "pdf-parse";

const fetchMetadata = async (req, res) => {
  const { identifier, type } = req.body;

  try {
    let metadata;
    if (type === "doi") {
      metadata = await fetchFromCrossRef(identifier);
    } else if (type === "arxiv") {
      metadata = await fetchFromArXiv(identifier);
    } else if (type === "pdf" && req.file) {
      metadata = await fetchFromPdf(req.file.buffer);
    } else {
      return res.status(400).json({ message: "Invalid request: missing identifier/type or PDF file." });
    }

    res.status(200).json(metadata);
  } catch (error) {
    console.error("Error fetching metadata:", error);
    res.status(500).json({ message: "Failed to fetch metadata", error: error.message });
  }
};

const fetchFromCrossRef = async (doi) => {
  const response = await axios.get(`https://api.crossref.org/works/${doi}`);
  const item = response.data.message;
  return {
    title: item.title ? item.title[0] : "",
    authors: item.author ? item.author.map(a => `${a.given || ''} ${a.family || ''}`).join(', ') : "",
    abstract: item.abstract || "",
    publishedDate: item.issued && item.issued['date-parts'] ? item.issued['date-parts'][0].join('-') : "",
    journal: item['container-title'] ? item['container-title'][0] : "",
    doi: item.DOI || "",
  };
};

const fetchFromArXiv = async (arxivId) => {
  const response = await axios.get(`http://export.arxiv.org/api/query?id_list=${arxivId}`);
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(response.data, "text/xml");
  const entry = xmlDoc.getElementsByTagName("entry")[0];

  return {
    title: entry.getElementsByTagName("title")[0].textContent,
    authors: Array.from(entry.getElementsByTagName("author")).map(author => author.getElementsByTagName("name")[0].textContent).join(', '),
    abstract: entry.getElementsByTagName("summary")[0].textContent,
    publishedDate: entry.getElementsByTagName("published")[0].textContent.split('T')[0],
    journal: "arXiv",
    arxivId: arxivId,
  };
};

const fetchFromPdf = async (buffer) => {
  const data = await pdfParse(buffer);
  // Basic extraction, might need more sophisticated parsing for better results
  return {
    title: data.info.Title || data.text.split('\n')[0],
    author: data.info.Author || "",
    abstract: data.text.substring(0, Math.min(data.text.length, 500)) + "...", // First 500 chars as abstract
    // Other metadata from PDF can be extracted from data.info
  };
};

export { fetchMetadata };

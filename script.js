// Global state
let papers = [];
let topics = [];
let selectedPaper = null;
let editingPaper = null;

const PAPERS_KEY = "papers_db";
const TOPICS_KEY = "topics_db";
const THEME_KEY = "theme";

// ===== PAGINATION VARIABLES (ADDED) =====
const PAPERS_PER_PAGE = 10; // Number of papers to display per page
let currentPage = 1;
let currentFilteredPapers = []; // Store current filtered list for pagination

let uploadedPdfData = null; // Holds currently uploaded PDF data in modal

// Initialize with sample data (if first load)
function initializeSampleData() {
  const samplePapers = [
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
    },
  ];
  papers = samplePapers;
  topics = ["Machine Learning", "Data Science", "Web Development"];
  saveToStorage();
}

function loadFromStorage() {
  const storedPapers = localStorage.getItem(PAPERS_KEY);
  if (storedPapers) {
    try {
      papers = JSON.parse(storedPapers);
    } catch {
      papers = [];
    }
  } else {
    papers = [];
  }

  const storedTopics = localStorage.getItem(TOPICS_KEY);
  if (storedTopics) {
    try {
      topics = JSON.parse(storedTopics);
    } catch {
      topics = [];
    }
  } else {
    topics = [];
  }

  if (!papers.length) initializeSampleData();
}

function saveToStorage() {
  localStorage.setItem(PAPERS_KEY, JSON.stringify(papers));
  localStorage.setItem(TOPICS_KEY, JSON.stringify(topics));
}

// Update topics filter dropdown
function updateTopicsFilter() {
  const filter = document.getElementById("topicFilter");
  filter.innerHTML = '<option value="">All Topics</option>';
  topics.forEach((topic) => {
    const option = document.createElement("option");
    option.value = topic;
    option.textContent = topic;
    filter.appendChild(option);
  });
}

// Modified filterPapers() to work with pagination
function filterPapers() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const selectedTopic = document.getElementById("topicFilter").value;
  const minYear = parseInt(document.getElementById("minYear").value) || null;
  const maxYear = parseInt(document.getElementById("maxYear").value) || null;
  const authorFilter = document
    .getElementById("authorFilter")
    .value.toLowerCase();

  // Filter papers based on search, topic, year, and author
  currentFilteredPapers = papers.filter((paper) => {
    const paperYear = parseInt(paper.year) || null;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm) ||
      paper.authors.toLowerCase().includes(searchTerm) ||
      (paper.abstract || "").toLowerCase().includes(searchTerm);
    const matchesTopic = selectedTopic === "" || paper.topic === selectedTopic;
    const matchesYear =
      (!minYear || paper.year >= minYear) &&
      (!maxYear || paper.year <= maxYear);
    const matchesAuthor =
      authorFilter === "" || paper.authors.toLowerCase().includes(authorFilter);

    return matchesSearch && matchesTopic && matchesYear && matchesAuthor;
  });

  currentPage = 1; // Reset page number when filters change
  renderPaginatedPapers(); // Call new paginated render
}

// New function: Renders only the papers for the current page
function renderPaginatedPapers() {
  const startIndex = (currentPage - 1) * PAPERS_PER_PAGE;
  const endIndex = startIndex + PAPERS_PER_PAGE;
  const papersToShow = currentFilteredPapers.slice(startIndex, endIndex);

  renderPapers(papersToShow); // Existing render function now only shows subset
  renderPaginationControls(); // Show pagination UI
}

// New function: Creates and updates pagination buttons
function renderPaginationControls() {
  const paginationContainer = document.getElementById("paginationControls");
  paginationContainer.innerHTML = "";

  const totalPages = Math.ceil(currentFilteredPapers.length / PAPERS_PER_PAGE);
  if (totalPages <= 1) {
    return; // No need to show pagination controls if only 1 page or empty
  }

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.textContent = "Previous";
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      renderPaginatedPapers();
    }
  };
  paginationContainer.appendChild(prevBtn);

  // Page number buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.textContent = i;
    pageBtn.disabled = i === currentPage;
    pageBtn.onclick = () => {
      currentPage = i;
      renderPaginatedPapers();
    };
    paginationContainer.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.textContent = "Next";
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderPaginatedPapers();
    }
  };
  paginationContainer.appendChild(nextBtn);
}

// Render papers list
function renderPapers(filteredPapers = papers) {
  const papersList = document.getElementById("papersList");
  const emptyState = document.getElementById("emptyState");
  const paperCount = document.getElementById("paperCount");

  paperCount.textContent = filteredPapers.length;

  if (filteredPapers.length === 0) {
    papersList.classList.add("hidden");
    emptyState.classList.remove("hidden");
    return;
  }

  emptyState.classList.add("hidden");
  papersList.classList.remove("hidden");

  papersList.innerHTML = filteredPapers
    .map(
      (paper) => `
        <div class="paper-card ${
          selectedPaper?.id === paper.id ? "selected" : ""
        }" onclick="selectPaper(${paper.id})">
            <div class="paper-header">
                <h3 class="paper-title">${paper.title}</h3>
                <div class="paper-actions">
                    ${
                      paper.url
                        ? `<button class="paper-action-btn" onclick="event.stopPropagation(); openPaperLink('${paper.url}')" title="Open paper link">
                        <i class="fas fa-external-link-alt"></i>
                    </button>`
                        : ""
                    }
                    <button class="paper-action-btn" onclick="event.stopPropagation(); editPaper(${
                      paper.id
                    })" title="Edit paper">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="paper-action-btn delete" onclick="event.stopPropagation(); deletePaper(${
                      paper.id
                    })" title="Delete paper">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <p class="paper-authors">${paper.authors}</p>
            <div class="paper-meta">
                ${
                  paper.topic
                    ? `<span class="topic-badge">${paper.topic}</span>`
                    : ""
                }
                ${
                  paper.year
                    ? `<span class="year-badge"><i class="fas fa-calendar"></i> ${paper.year}</span>`
                    : ""
                }
                ${paper.tags
                  .map((tag) => `<span class="tag-badge">#${tag}</span>`)
                  .join("")}
            </div>
        </div>
        `
    )
    .join("");
}

// Select paper and show details
function selectPaper(id) {
  selectedPaper = papers.find((p) => p.id === id);
  showPaperDetails();
  renderPapers(); // Re-render to update selection
}

// Show paper details including PDF preview if available
function showPaperDetails() {
  if (!selectedPaper) return;

  const noSelection = document.getElementById("noSelection");
  const paperDetails = document.getElementById("paperDetails");
  const detailsContent = document.getElementById("detailsContent");

  noSelection.classList.add("hidden");
  paperDetails.classList.remove("hidden");

  detailsContent.innerHTML = `
        <div class="detail-section">
            <h3>${selectedPaper.title}</h3>
            <p>${selectedPaper.authors}</p>
        </div>

        ${
          selectedPaper.url
            ? `
        <div class="detail-section">
            <h4>Paper Link</h4>
            <a href="#" class="paper-link" onclick="openPaperLink('${selectedPaper.url}')">
                <i class="fas fa-external-link-alt"></i>
                Open Paper
            </a>
        </div>
        `
            : ""
        }

        ${
          selectedPaper.abstract
            ? `
        <div class="detail-section">
            <h4>Abstract</h4>
            <p>${selectedPaper.abstract}</p>
        </div>
        `
            : ""
        }

        ${
          selectedPaper.notes
            ? `
        <div class="detail-section">
            <h4>Notes</h4>
            <p>${selectedPaper.notes}</p>
        </div>
        `
            : ""
        }

        <div class="details-grid">
            ${
              selectedPaper.year
                ? `
            <div>
                <span style="font-weight: 500; color: #374151;">Year:</span>
                <p>${selectedPaper.year}</p>
            </div>
            `
                : ""
            }
            ${
              selectedPaper.journal
                ? `
            <div>
                <span style="font-weight: 500; color: #374151;">Journal:</span>
                <p>${selectedPaper.journal}</p>
            </div>
            `
                : ""
            }
        </div>

        ${
          selectedPaper.tags.length > 0
            ? `
        <div class="detail-section">
            <h4>Tags</h4>
            <div class="tags-container">
                ${selectedPaper.tags
                  .map((tag) => `<span class="detail-tag">#${tag}</span>`)
                  .join("")}
            </div>
        </div>
        `
            : ""
        }

        ${
          selectedPaper.pdfData
            ? `
        <div class="detail-section">
            <h4>PDF Preview</h4>
            <iframe src="${selectedPaper.pdfData}" class="pdf-preview" frameborder="0"></iframe>
        </div>
        `
            : ""
        }

        <div class="citation-section">
            <h4>Generate Citation</h4>
            <div>
                ${["APA", "MLA", "Chicago"]
                  .map(
                    (style) => `
                <div class="citation-item">
                    <div class="citation-header">
                        <span class="citation-style">${style}</span>
                        <button class="copy-btn" onclick="copyToClipboard('${generateCitation(
                          selectedPaper,
                          style
                        ).replace(/'/g, "\\'")}')">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                    <p class="citation-text">${generateCitation(
                      selectedPaper,
                      style
                    )}</p>
                </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    `;
}

// Close paper details
function closeDetails() {
  selectedPaper = null;
  const noSelection = document.getElementById("noSelection");
  const paperDetails = document.getElementById("paperDetails");

  noSelection.classList.remove("hidden");
  paperDetails.classList.add("hidden");
  renderPapers(); // Re-render to update selection
}

// Show add form modal
function showAddForm() {
  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = "Add New Paper";
  document.getElementById("submitText").textContent = "Add Paper";
  resetForm();

  clearPdfData();
}

// Hide add form modal
function hideAddForm() {
  document.getElementById("modalOverlay").classList.add("hidden");
  resetForm();
}

// Reset form
function resetForm() {
  document.getElementById("paperForm").reset();
  editingPaper = null;
  clearPdfData();
}

// Edit paper
function editPaper(id) {
  editingPaper = papers.find((p) => p.id === id);
  if (!editingPaper) return;

  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = "Edit Paper";
  document.getElementById("submitText").textContent = "Update Paper";

  // Populate form with paper data
  document.getElementById("title").value = editingPaper.title;
  document.getElementById("authors").value = editingPaper.authors;
  document.getElementById("year").value = editingPaper.year || "";
  document.getElementById("journal").value = editingPaper.journal || "";
  document.getElementById("url").value = editingPaper.url || "";
  document.getElementById("topic").value = editingPaper.topic || "";
  document.getElementById("tags").value = editingPaper.tags.join(", ");
  document.getElementById("abstract").value = editingPaper.abstract || "";
  document.getElementById("notes").value = editingPaper.notes || "";

  if (editingPaper.pdfData) {
    uploadedPdfData = editingPaper.pdfData;
    showPdfPreview(uploadedPdfData);
  } else {
    clearPdfData();
  }
}

// Delete paper
function deletePaper(id) {
  Swal.fire({
    title: "Are you sure?",
    text: "This paper will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      papers = papers.filter((p) => p.id !== id);
      if (selectedPaper && selectedPaper.id === id) {
        closeDetails();
      }
      saveToStorage();
      renderPapers();
      filterPapers();

      Swal.fire({
        title: "Deleted!",
        text: "The paper has been deleted.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
}

// Handle form submission
document.getElementById("paperForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = {
    title: document.getElementById("title").value.trim(),
    authors: document.getElementById("authors").value.trim(),
    year: document.getElementById("year").value.trim(),
    journal: document.getElementById("journal").value.trim(),
    url: document.getElementById("url").value.trim(),
    topic: document.getElementById("topic").value.trim(),
    tags: document.getElementById("tags").value.trim(),
    abstract: document.getElementById("abstract").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };

  if (!formData.title || !formData.authors) {
    alert("Please fill in required fields (Title and Authors)");
    return;
  }

  const newPaper = {
    id: editingPaper ? editingPaper.id : Date.now(),
    ...formData,
    tags: formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag),
    dateAdded: editingPaper
      ? editingPaper.dateAdded
      : new Date().toISOString().split("T")[0],
    pdfData: uploadedPdfData || null, // Save uploaded PDF base64 data or null
  };

  if (editingPaper) {
    const index = papers.findIndex((p) => p.id === editingPaper.id);
    papers[index] = newPaper;
    if (selectedPaper && selectedPaper.id === editingPaper.id) {
      selectedPaper = newPaper;
      showPaperDetails();
    }
  } else {
    papers.push(newPaper);
  }

  if (formData.topic && !topics.includes(formData.topic)) {
    topics.push(formData.topic);
    updateTopicsFilter();
  }

  saveToStorage();

  hideAddForm();
  renderPapers();
  filterPapers();
});

// Generate citation
function generateCitation(paper, style) {
  const { title, authors, year, journal } = paper;
  if (style === "APA") {
    return `${authors} (${year}). ${title}. ${journal}.`;
  } else if (style === "MLA") {
    return `${authors}. "${title}" ${journal}, ${year}.`;
  } else if (style === "Chicago") {
    return `${authors}. "${title}" ${journal} (${year}).`;
  }
  return "";
}

// Copy to clipboard
function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      console.log("Citation copied to clipboard");
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
    });
}

// Open paper link
function openPaperLink(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

// Close modal when clicking outside
document.getElementById("modalOverlay").addEventListener("click", function (e) {
  if (e.target === this) {
    hideAddForm();
  }
});

// Handle keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    if (!document.getElementById("modalOverlay").classList.contains("hidden")) {
      hideAddForm();
    } else if (selectedPaper) {
      closeDetails();
    }
  }
});

//Menu functionality

const menuOpenButton = document.getElementById("menu-open-btn");
const menuCloseButton = document.getElementById("menu-close-btn");
const menuItemsContainer = document.getElementById("menu-items-container");
const menuItems = document.querySelectorAll(".menu-item");

const displayMenu = () => {
  menuItemsContainer.style.display = "flex";
  menuCloseButton.style.display = "block";
};

const hideMenu = () => {
  menuItemsContainer.style.display = "none";
  menuCloseButton.style.display = "none";
};

menuOpenButton.addEventListener("click", displayMenu);

menuCloseButton.addEventListener("click", hideMenu);

menuItems.forEach((menuItem) => menuItem.addEventListener("click", hideMenu));

// Dark Mode: Initialization & Toggle
function applyThemeFromStorage() {
  const theme = localStorage.getItem(THEME_KEY);
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    setDarkModeIcon(true);
  } else {
    document.body.classList.remove("dark-mode");
    setDarkModeIcon(false);
  }
}
function setDarkModeIcon(isDark) {
  const icon = document.getElementById("darkModeToggle").querySelector("i");
  if (!icon) return;
  if (isDark) {
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
  } else {
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  }
}

document
  .getElementById("darkModeToggle")
  .addEventListener("click", function () {
    const isNowDark = !document.body.classList.contains("dark-mode");
    document.body.classList.toggle("dark-mode");
    setDarkModeIcon(isNowDark);
    localStorage.setItem(THEME_KEY, isNowDark ? "dark" : "light");
  });

// PDF Upload & Preview handling

const pdfUploadInput = document.getElementById("pdfUpload");
const pdfPreviewContainer = document.getElementById("pdfPreviewContainer");
const pdfPreviewIframe = document.getElementById("pdfPreview");
const clearPdfBtn = document.getElementById("clearPdfBtn");

pdfUploadInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.type === "application/pdf") {
    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedPdfData = e.target.result; // base64 string
      showPdfPreview(uploadedPdfData);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please upload a valid PDF file.");
    clearPdfData();
  }
});

clearPdfBtn.addEventListener("click", function () {
  clearPdfData();
});

function showPdfPreview(dataUrl) {
  if (!dataUrl) {
    pdfPreviewContainer.classList.add("hidden");
    pdfPreviewIframe.src = "";
    return;
  }
  pdfPreviewIframe.src = dataUrl;
  pdfPreviewContainer.classList.remove("hidden");
}

function clearPdfData() {
  uploadedPdfData = null;
  pdfUploadInput.value = "";
  showPdfPreview(null);
}

// Modified initial load to use pagination
document.addEventListener("DOMContentLoaded", function () {
  loadFromStorage();
  updateTopicsFilter();
  currentFilteredPapers = papers; // Initialize with full list
  renderPaginatedPapers(); // Render first page
  applyThemeFromStorage();
});

// Make filter controls responsive to changes
document.getElementById("topicFilter").addEventListener("change", filterPapers);
document.getElementById("searchInput").addEventListener("input", filterPapers);
document.getElementById("paperForm").addEventListener("submit", function (e) {
  e.preventDefault();

  // Show the loading spinner
  document.getElementById("loadingSpinner").classList.remove("hidden");

  // Simulate form processing (replace this with actual save logic)
  setTimeout(() => {
    document.getElementById("loadingSpinner").classList.add("hidden");

    Swal.fire({
      icon: "success",
      title: "Paper added successfully!",
    });

    hideAddForm(); // Optional: close the modal after save
  }, 1500);
});

// ===== AI ASSISTANT FEATURES =====

// Global variables for AI features
let currentSummary = null;
let speechSynthesis = window.speechSynthesis;
let currentUtterance = null;
let aiChatHistory = [];

// Tab switching functionality
function switchTab(tabName) {
  // Remove active class from all tabs and panes
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
  
  // Add active class to selected tab and pane
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(`${tabName}-tab`).classList.add('active');
}

// AI Configuration from config.js
const GEMINI_API_KEY = AI_CONFIG.GEMINI_API_KEY;
const GEMINI_API_URL = AI_CONFIG.GEMINI_API_URL;

// AI Summary Generation
async function generateSummary() {
  if (!selectedPaper) {
    Swal.fire({
      icon: "error",
      title: "No paper selected",
      text: "Please select a paper first to generate a summary."
    });
    return;
  }

  // Check API key configuration
  if (GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY') {
    Swal.fire({
      icon: 'info',
      title: 'API Key Required',
      html: `
        <p>To use real AI features, please configure your Gemini API key:</p>
        <ol style="text-align: left; margin: 20px 0;">
          <li>Get your API key from <a href="https://makersuite.google.com/app/apikey" target="_blank">Google AI Studio</a></li>
          <li>Open <code>config.js</code> and replace <code>YOUR_GEMINI_API_KEY</code></li>
          <li>Refresh the page and try again</li>
        </ol>
        <p><strong>For now, using fallback mode with mock data.</strong></p>
      `,
      confirmButtonText: 'Continue with Fallback'
    });
  }

  const loadingElement = document.getElementById('summaryLoading');
  const contentElement = document.getElementById('summaryContent');
  const generateBtn = document.getElementById('generateSummaryBtn');
  const readBtn = document.getElementById('readSummaryBtn');

  // Show loading state
  loadingElement.classList.remove('hidden');
  contentElement.innerHTML = '';
  generateBtn.disabled = true;

  try {
    // Prepare paper data for AI analysis
    const paperData = {
      title: selectedPaper.title,
      authors: selectedPaper.authors,
      abstract: selectedPaper.abstract || 'No abstract available',
      notes: selectedPaper.notes || 'No notes available',
      topic: selectedPaper.topic || 'General',
      year: selectedPaper.year || 'Unknown',
      tags: selectedPaper.tags || []
    };

    // Generate summary using AI
    const summary = await generateAISummary(paperData);
    
    // Display the summary
    contentElement.innerHTML = `
      <div class="summary-section">
        <h4><i class="fas fa-lightbulb"></i> TL;DR Summary</h4>
        <p>${summary.tlDr || summary.tldr}</p>
      </div>
      <div class="summary-section">
        <h4><i class="fas fa-list"></i> Key Points</h4>
        <ul>
          ${summary.keyPoints.map(point => `<li>${point}</li>`).join('')}
        </ul>
      </div>
      <div class="summary-section">
        <h4><i class="fas fa-search"></i> Detailed Analysis</h4>
        <p>${summary.detailedAnalysis || summary.detailed}</p>
      </div>
      <div class="summary-section">
        <h4><i class="fas fa-question-circle"></i> Research Questions</h4>
        <ul>
          ${(summary.researchQuestions || summary.questions).map(q => `<li>${q}</li>`).join('')}
        </ul>
      </div>
    `;

    currentSummary = summary;
    readBtn.disabled = false;

    const successMessage = GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' 
      ? 'Mock summary generated successfully. Configure API key for real AI features.'
      : 'AI has analyzed the research paper and generated a comprehensive summary.';

    Swal.fire({
      icon: "success",
      title: "Summary Generated!",
      text: successMessage,
      timer: 3000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('Error generating summary:', error);
    contentElement.innerHTML = `
      <div class="summary-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Failed to generate summary. Using fallback mode.</p>
        <small>Error: ${error.message}</small>
      </div>
    `;
    
    Swal.fire({
      icon: "warning",
      title: "Using Fallback Mode",
      text: "AI service unavailable. Using mock data for demonstration.",
      timer: 3000,
      showConfirmButton: false
    });
  } finally {
    loadingElement.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// Real AI Summary Generation
async function generateAISummary(paperData) {
    try {
        const prompt = `Analyze this research paper and provide a comprehensive summary:

Title: ${paperData.title}
Authors: ${paperData.authors}
Abstract: ${paperData.abstract}
Year: ${paperData.year}
Keywords: ${paperData.keywords}

Please provide:
1. TL;DR (2-3 sentences)
2. Key Points (5-7 bullet points)
3. Detailed Analysis (3-4 paragraphs)
4. Research Questions (3-5 questions for further investigation)

Format the response as JSON with these exact keys: tlDr, keyPoints, detailedAnalysis, researchQuestions`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response format');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Try to parse JSON response
        try {
            const parsedResponse = JSON.parse(aiResponse);
            return {
                tlDr: parsedResponse.tlDr || "AI summary generation completed.",
                keyPoints: parsedResponse.keyPoints || ["Key points extracted successfully."],
                detailedAnalysis: parsedResponse.detailedAnalysis || "Detailed analysis provided by AI.",
                researchQuestions: parsedResponse.researchQuestions || ["What are the main findings?"]
            };
        } catch (parseError) {
            // If JSON parsing fails, create a structured response from the text
            return {
                tlDr: aiResponse.substring(0, 200) + "...",
                keyPoints: ["AI analysis completed", "Key insights extracted", "Research implications identified"],
                detailedAnalysis: aiResponse,
                researchQuestions: ["What are the main contributions?", "How does this advance the field?", "What are the limitations?"]
            };
        }
    } catch (error) {
        console.error('AI Summary Generation Error:', error);
        // Fallback to mock data if API fails
        return {
            tlDr: "AI service temporarily unavailable. Using fallback summary.",
            keyPoints: [
                "Paper focuses on " + paperData.title.toLowerCase(),
                "Published in " + paperData.year,
                "Authors: " + paperData.authors,
                "Key area: " + (paperData.keywords || "Research"),
                "Abstract available for detailed review"
            ],
            detailedAnalysis: `This research paper titled "${paperData.title}" by ${paperData.authors} was published in ${paperData.year}. The study addresses important questions in the field and provides valuable insights. The abstract indicates significant findings that contribute to the existing body of knowledge. Further analysis would require access to the full paper content.`,
            researchQuestions: [
                "What are the main research questions addressed?",
                "How do the findings compare to previous studies?",
                "What are the practical implications of this research?",
                "What future research directions are suggested?"
            ]
        };
    }
}

// Voice Reading Functionality
function readSummary() {
  if (!currentSummary) {
    Swal.fire({
      icon: "warning",
      title: "No Summary Available",
      text: "Please generate a summary first before using the read aloud feature."
    });
    return;
  }

  const readBtn = document.getElementById('readSummaryBtn');
  const stopBtn = document.getElementById('stopReadingBtn');
  
  // Prepare text for reading
  const textToRead = `
    Summary of ${selectedPaper.title}.
    ${currentSummary.tldr}
    Key points: ${currentSummary.keyPoints.join('. ')}
    ${currentSummary.detailed}
  `;

  // Create utterance
  currentUtterance = new SpeechSynthesisUtterance(textToRead);
  currentUtterance.rate = 0.9;
  currentUtterance.pitch = 1;
  currentUtterance.volume = 1;

  // Update UI
  readBtn.disabled = true;
  stopBtn.disabled = false;

  // Start reading
  speechSynthesis.speak(currentUtterance);

  // Handle completion
  currentUtterance.onend = () => {
    readBtn.disabled = false;
    stopBtn.disabled = true;
  };
}

function stopReading() {
  if (currentUtterance) {
    speechSynthesis.cancel();
    currentUtterance = null;
  }
  
  document.getElementById('readSummaryBtn').disabled = false;
  document.getElementById('stopReadingBtn').disabled = true;
}

// Visualizations Generation
async function generateVisuals() {
  if (!selectedPaper) {
    Swal.fire({
      icon: "error",
      title: "No paper selected",
      text: "Please select a paper first to generate visualizations."
    });
    return;
  }

  const loadingElement = document.getElementById('visualsLoading');
  const contentElement = document.getElementById('visualsContent');
  const generateBtn = document.getElementById('generateVisualsBtn');

  // Show loading state
  loadingElement.classList.remove('hidden');
  contentElement.innerHTML = '';
  generateBtn.disabled = true;

  try {
    // Generate mock visualization data
    const chartData = await generateChartData(selectedPaper);
    
    // Create charts
    contentElement.innerHTML = `
      <div class="chart-container">
        <h4>Keyword Frequency Analysis</h4>
        <canvas id="keywordChart" width="400" height="200"></canvas>
      </div>
      <div class="chart-container">
        <h4>Research Impact Timeline</h4>
        <canvas id="timelineChart" width="400" height="200"></canvas>
      </div>
      <div class="chart-container">
        <h4>Topic Distribution</h4>
        <canvas id="topicChart" width="400" height="200"></canvas>
      </div>
    `;

    // Render charts
    renderKeywordChart(chartData.keywords);
    renderTimelineChart(chartData.timeline);
    renderTopicChart(chartData.topics);

    Swal.fire({
      icon: "success",
      title: "Visualizations Generated!",
      text: "Data visualizations have been created for the research paper.",
      timer: 2000,
      showConfirmButton: false
    });

  } catch (error) {
    console.error('Error generating visuals:', error);
    contentElement.innerHTML = `
      <p class="visuals-placeholder">Error generating visualizations. Please try again.</p>
    `;
    
    Swal.fire({
      icon: "error",
      title: "Generation Failed",
      text: "Failed to generate visualizations. Please try again."
    });
  } finally {
    loadingElement.classList.add('hidden');
    generateBtn.disabled = false;
  }
}

// Generate mock chart data
async function generateChartData(paper) {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    keywords: {
      labels: ['Machine Learning', 'Neural Networks', 'Deep Learning', 'AI', 'Data Science'],
      data: [85, 72, 68, 65, 58]
    },
    timeline: {
      labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
      data: [10, 25, 45, 80, 120, 180]
    },
    topics: {
      labels: ['Computer Science', 'Mathematics', 'Engineering', 'Physics', 'Biology'],
      data: [40, 25, 20, 10, 5]
    }
  };
}

// Chart rendering functions
function renderKeywordChart(data) {
  const ctx = document.getElementById('keywordChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Frequency',
        data: data.data,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderTimelineChart(data) {
  const ctx = document.getElementById('timelineChart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Citations',
        data: data.data,
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function renderTopicChart(data) {
  const ctx = document.getElementById('topicChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.labels,
      datasets: [{
        data: data.data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// AI Chat Functionality
function handleAiChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendAiMessage();
  }
}

function sendAiMessage() {
  const input = document.getElementById('aiChatInput');
  const message = input.value.trim();
  
  if (!message) return;
  
  if (!selectedPaper) {
    Swal.fire({
      icon: "error",
      title: "No paper selected",
      text: "Please select a paper first to chat with the AI assistant."
    });
    return;
  }

  // Add user message to chat
  addChatMessage(message, 'user');
  input.value = '';

  // Generate AI response
  generateAIResponse(message);
}

function addChatMessage(content, sender) {
  const messagesContainer = document.getElementById('aiChatMessages');
  const messageDiv = document.createElement('div');
  messageDiv.className = `ai-message ${sender}`;
  
  if (sender === 'user') {
    messageDiv.innerHTML = `
      <div class="ai-message-content">
        <p>${content}</p>
      </div>
      <i class="fas fa-user"></i>
    `;
  } else {
    messageDiv.innerHTML = `
      <i class="fas fa-robot"></i>
      <div class="ai-message-content">
        <p>${content}</p>
      </div>
    `;
  }
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Real AI Chat Response Generation
async function generateAIResponse(userMessage) {
    const currentPaper = getCurrentPaper();
    if (!currentPaper) {
        addChatMessage("Please select a research paper first to enable AI assistance.", 'ai');
        return;
    }

    try {
        const context = `You are an AI research assistant helping with a paper titled "${currentPaper.title}" by ${currentPaper.authors} (${currentPaper.year}). 
        
        Paper context: ${currentPaper.abstract || 'Abstract not available'}
        
        User question: ${userMessage}
        
        Provide a helpful, academic response based on the paper context. If the question is about methodology, results, limitations, or future work, provide specific insights. Keep responses concise but informative.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: context
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Invalid API response format');
        }

        const aiResponse = data.candidates[0].content.parts[0].text;
        addChatMessage(aiResponse, 'ai');
        
    } catch (error) {
        console.error('AI Chat Error:', error);
        // Fallback to context-aware mock responses
        const fallbackResponse = generateFallbackResponse(userMessage, currentPaper);
        addChatMessage(fallbackResponse, 'ai');
    }
}

// Fallback response generator for when API fails
function generateFallbackResponse(userMessage, paper) {
    const message = userMessage.toLowerCase();
    
    if (message.includes('methodology') || message.includes('method')) {
        return `Based on the paper "${paper.title}", the methodology section would typically describe the research approach, data collection methods, and analysis techniques used. For specific details, you would need to review the full paper.`;
    } else if (message.includes('result') || message.includes('finding')) {
        return `The results of "${paper.title}" likely present the main findings and outcomes of the research. The abstract may provide a brief overview, but detailed results would be in the full paper.`;
    } else if (message.includes('limitation') || message.includes('weakness')) {
        return `Research limitations in "${paper.title}" might include sample size constraints, methodology limitations, or scope restrictions. These are typically discussed in the paper's conclusion or discussion section.`;
    } else if (message.includes('future') || message.includes('next')) {
        return `Future research directions for "${paper.title}" could involve expanding the study scope, testing in different contexts, or addressing identified limitations. The paper likely suggests areas for further investigation.`;
    } else if (message.includes('contribution') || message.includes('impact')) {
        return `The contributions of "${paper.title}" to the field include advancing knowledge in this area and potentially providing practical insights or theoretical developments.`;
    } else {
        return `I can help you understand "${paper.title}" by ${paper.authors}. What specific aspect would you like to know more about? I can discuss methodology, results, limitations, future work, or general insights.`;
    }
}

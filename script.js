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
  const includeCitations = document.getElementById("includeCitations")?.checked;
  const includePatents = document.getElementById("includePatents")?.checked;
  const favoriteFilter = document.getElementById("favoriteFilter")?.value;
  const ratingFilter = document.getElementById("ratingFilter")?.value;
  const sortFilter = document.getElementById("sortFilter")?.value;

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
    //Checkboxes logic
    if (includeCitations && !paper.isCitation) return false;
    if (includePatents && !paper.isPatent) return false;

    // Favorite filter
    const matchesFavorite = 
      favoriteFilter === "" || 
      (favoriteFilter === "favorites" && paper.isFavorite) ||
      (favoriteFilter === "non-favorites" && !paper.isFavorite);

    // Rating filter
    const paperRating = paper.rating || 0;
    const matchesRating = 
      ratingFilter === "" ||
      (ratingFilter === "0" && paperRating === 0) ||
      (ratingFilter !== "0" && paperRating >= parseInt(ratingFilter));
    return matchesSearch && matchesTopic && matchesYear && matchesAuthor && matchesFavorite && matchesRating;
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

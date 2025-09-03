
// Global state
let papers = [];
let topics = [];
let selectedPaper = null;
let editingPaper = null;
let utterance = null;
let full_text = "";
let nvoice = null;
let pdf = null; // Holds PDF.js document
let current_page = 1;
let isSpeechPaused = false; // Track pause/resume state
let isSpeechActive = false; // Track if speech is currently active
const PAPERS_KEY = "papers_db";
const TOPICS_KEY = "topics_db";



// ===== PAGINATION VARIABLES (ADDED) =====
const PAPERS_PER_PAGE = 10; // Number of papers to display per page
let currentPage = 1;
let currentFilteredPapers = []; // Store current filtered list for pagination

let uploadedPdfData = null; // Holds currently uploaded PDF data in modal



// Authentication check 
function checkAuthentication() {
  const currentUser = localStorage.getItem('current_user');
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Add user info display and logout functionality
function initUserInterface() {
  const currentUser = JSON.parse(localStorage.getItem('current_user'));
  if (currentUser) {
    updateHeaderWithUserInfo(currentUser);
  }
}

function updateHeaderWithUserInfo(user) {
  const headerButtons = document.querySelector('.header-buttons');
  
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.innerHTML = `
    <button class="user-btn" onclick="toggleUserDropdown()">
      <i class="fas fa-user"></i>
      ${user.name}
      <i class="fas fa-chevron-down"></i>
    </button>
    <div class="user-dropdown hidden" id="userDropdown">
      <div class="user-info">
        <strong>${user.name}</strong>
        <small>${user.email}</small>
      </div>
      <hr>
      <button onclick="logout()" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  `;
  headerButtons.insertBefore(userMenu, headerButtons.firstChild);
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('hidden');
}

function logout() {
  Swal.fire({
    title: 'Logout',
    text: 'Are you sure you want to logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('current_user');
      window.location.href = 'login.html';
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  
  if (!checkAuthentication()) {
    return;
  }
  
  initUserInterface();
  
  loadFromStorage();
  updateTopicsFilter();
  currentFilteredPapers = papers;
  renderPaginatedPapers();
  applyThemeFromStorage();
});
document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  
  if (userMenu && !userMenu.contains(e.target)) {
    if (dropdown) dropdown.classList.add('hidden');
  }
});



// Initialize with sample data (if first load)
function initializeSampleData() {
  const samplePapers = [
    {
      id: 1,
      title: "Attention Is All You Need",
      authors: "Vaswani, A., Shazeer, N., Parmar, N., et al.",
      year: 2017,
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
      rating: 5,
      isFavorite: true,
    },
    {
      id: 2,
      title: "BERT: Pre-training of Deep Bidirectional Transformers",
      authors: "Devlin, J., Chang, M. W., Lee, K., Toutanova, K.",
      year: 2018,
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
      rating: 4,
      isFavorite: false,
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
      // Ensure backward compatibility for rating and favorite fields
      papers = papers.map(paper => ({
        ...paper,
        rating: paper.rating || 0,
        isFavorite: paper.isFavorite || false
      }));
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
  const favoriteFilter = document.getElementById("favoriteFilter")?.value;
  const ratingFilter = document.getElementById("ratingFilter")?.value;
  const sortFilter = document.getElementById("sortFilter")?.value;
 

  // Filter papers based on search, topic, year, author, favorites, and rating
  currentFilteredPapers = papers.filter((paper) => {
    const paperYear = parseInt(paper.year) || null;
    const matchesSearch =
      paper.title.toLowerCase().includes(searchTerm) ||
      paper.authors.toLowerCase().includes(searchTerm) ||
      (paper.abstract || "").toLowerCase().includes(searchTerm);
    const matchesTopic = selectedTopic === "" || paper.topic === selectedTopic;
    const matchesYear =
      (!minYear || paper.year >= minYear);

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
    
    return matchesSearch && matchesTopic && matchesYear && matchesFavorite && matchesRating;
  });

  // Sort papers based on selected criteria
  currentFilteredPapers.sort((a, b) => {
    switch (sortFilter) {
      case "rating-desc":
        return (b.rating || 0) - (a.rating || 0);
      case "rating-asc":
        return (a.rating || 0) - (b.rating || 0);
      case "favorites":
        return (b.isFavorite || false) - (a.isFavorite || false);
      case "title-asc":
        return a.title.localeCompare(b.title);
      case "title-desc":
        return b.title.localeCompare(a.title);
      case "year-desc":
        return (parseInt(b.year) || 0) - (parseInt(a.year) || 0);
      case "year-asc":
        return (parseInt(a.year) || 0) - (parseInt(b.year) || 0);
      case "":
      default:
        // Default sort: by date added (newest first), then by title
        const dateComparison = (b.dateAdded || "").localeCompare(a.dateAdded || "");
        return dateComparison !== 0 ? dateComparison : a.title.localeCompare(b.title);
    }

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
                    <button class="paper-action-btn" onclick="event.stopPropagation(); toggleFavorite(${
                      paper.id
                    })" title="${
        paper.isFavorite ? "Remove from favorites" : "Add to favorites"
      }">
                        <i class="fas fa-heart ${
                          paper.isFavorite ? "paper-favorite" : ""
                        }"></i>
                    </button>
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
            
            <!-- Quick Rating Stars -->
            <div class="paper-quick-rating">
                <span class="rating-label">Rate:</span>
                <div class="quick-stars" data-paper-id="${paper.id}">
                    ${[1, 2, 3, 4, 5]
                      .map(
                        (starNum) => `
                        <span class="quick-star ${
                          paper.rating >= starNum ? "active" : ""
                        }" 
                              data-rating="${starNum}" 
                              onclick="event.stopPropagation(); setQuickRating(${
                                paper.id
                              }, ${starNum})"
                              title="Rate ${starNum} star${starNum > 1 ? "s" : ""}">★</span>
                    `
                      )
                      .join("")}
                </div>
                <span class="current-rating">${
                  paper.rating > 0 ? `(${paper.rating}/5)` : "(unrated)"
                }</span>
            </div>
            
            <div class="paper-meta-extended">
                <div class="rating-favorite-row">
                    ${
                      paper.isFavorite
                        ? `<div class="paper-favorite">
                        <i class="fas fa-heart"></i> Favorite
                    </div>`
                        : ""
                    }
                </div>
            </div>
        </div>
        `
    )
    .join("");
}
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
async function speakText() {
  if(nvoice===null || speechSynthesis.getVoices().length===0){
    window.speechSynthesis.onvoiceschanged = () => {
      const nvoices = window.speechSynthesis.getVoices();
      if(nvoices.length > 0){
        nvoice = nvoices.find(v => v.name === "Google US English") || nvoices[0];
      }
    };
  }
  if(currentPage > pdf.numPages){
    if(confirm("You have reached the end of the document. Would you like to restart?")){
      currentPage = 1;
      speakText();
    }
    return;
  }
  if (utterance) {
    window.speechSynthesis.cancel();
  }
  // Reset pause state when starting new speech
  isSpeechPaused = false;
  isSpeechActive = true;
  updateTTSButtons();
  
  const page = await pdf.getPage(currentPage);
  const textContent = await page.getTextContent();
  const pageText = textContent.items.map(item => item.str).join(" ");  
  utterance = new SpeechSynthesisUtterance(pageText);
  utterance.voice=nvoice;
  utterance.lang="en-US";
  utterance.rate=1;
  utterance.pitch=1; // optional: add events
  utterance.onstart = () => {
    isSpeechPaused = false;
    isSpeechActive = true;
    updateTTSButtons();
  };
  utterance.onend = () => {
    if(currentPage >= pdf.numPages) {
      // Speech has ended completely
      isSpeechActive = false;
      isSpeechPaused = false;
      updateTTSButtons();
    } else {
      currentPage++;
      speakText(); // Recursively speak next page
    }
  };
  utterance.onerror = () => {
    // Handle speech error
    isSpeechActive = false;
    isSpeechPaused = false;
    updateTTSButtons();
  };
  window.speechSynthesis.speak(utterance);
}
function pauseSpeech() {
  if (utterance) {
    window.speechSynthesis.pause();
    isSpeechPaused = true;
    updateTTSButtons();
  }
}
function resumeSpeech() {
  if (utterance) {
    window.speechSynthesis.resume();
    isSpeechPaused = false;
    updateTTSButtons();
  }
}
function togglePlayPause() {
  if (!isSpeechActive) {
    // Start playing
    speakText();
  } else if (isSpeechPaused) {
    // Resume speech
    resumeSpeech();
  } else {
    // Pause speech
    pauseSpeech();
  }
}
function stopSpeech() {
  if (utterance) {
    window.speechSynthesis.cancel();
    isSpeechPaused = false;
    isSpeechActive = false;
    updateTTSButtons();
  }
}
function updateTTSButtons() {
  const playPauseBtn = document.getElementById("playPauseBtn");
  const stopBtn = document.getElementById("stopBtn");
  
  // Update play/pause button
  if (playPauseBtn) {
    if (!isSpeechActive) {
      // Not playing - show play button
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Play';
      playPauseBtn.className = 'tts-btn tts-play';
    } else if (isSpeechPaused) {
      // Paused - show resume button
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
      playPauseBtn.className = 'tts-btn tts-resume';
    } else {
      // Playing - show pause button
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
      playPauseBtn.className = 'tts-btn tts-pause';
    }
  }
  
  // Enable/disable stop button based on speech activity
  if (stopBtn) {
    stopBtn.disabled = !isSpeechActive;
  }
}
function setSpeechRate(rate) {
  if (utterance) {
    utterance.rate = rate;
    stopSpeech();
    speakText(utterance.text);
  }
}



// Select paper and show details
 async function selectPaper(id) {
  if(utterance){
     window.speechSynthesis.cancel();
     currentPage=1;
     utterance=null; // Prevent triggering next page speech
  }
  selectedPaper = papers.find((p) => p.id === id);
  const base64 = selectedPaper.pdfData.split(',')[1]; // Remove data URL prefix
  const arrayBuffer = base64ToArrayBuffer(base64);
  pdf=await pdfjsLib.getDocument({data: arrayBuffer}).promise;
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

        <div class="detail-section">
            <div class="rating-favorite-details">
                <div class="rating-display">
                   <span class="detail-label">Rating:</span>

                    ${
                      selectedPaper.rating > 0
                        ? `
                    <div class="paper-rating">
                        <span class="stars">${"★".repeat(
                          selectedPaper.rating
                        )}${"☆".repeat(5 - selectedPaper.rating)}</span>
                        <span class="rating-text">(${selectedPaper.rating}/5)</span>
                    </div>
                    `
                        : `<span class="rating-text">Unrated</span>`
                    }
                </div>
                <div class="favorite-display">
                   <span class="detail-label">Favorite:</span>

                    ${
                      selectedPaper.isFavorite
                        ? `<span class="paper-favorite"><i class="fas fa-heart"></i> Yes</span>`
                        : `<span class="rating-text">No</span>`
                    }
                </div>
            </div>
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
               <span class="detail-label">Year:</span>
                <p>${selectedPaper.year}</p>
            </div>
            `
                : ""
            }
            ${
              selectedPaper.journal
                ? `
            <div>
               <span class="detail-label">Journal:</span>
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
        <div class="tts-controls">
              <button id="playPauseBtn" class="tts-btn tts-play" onclick="togglePlayPause()">
                <i class="fas fa-play"></i>
                Play
              </button>
              <button id="stopBtn" class="tts-btn tts-stop" onclick="stopSpeech()">
                <i class="fas fa-stop"></i>
                Stop
              </button>
              <div class="speed-control">
                <label for="rate">Speed:</label>
                <input type="number" id="rate" value="1" step="0.1" min="0.5" max="2">
              </div>
            </div>
            
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
    setTimeout(() => {
        updateTTSButtons();
    }, 100);
}
// ✅ Apply dark mode if active
if (document.body.classList.contains("dark-mode")) {
    detailsContent.classList.add("dark-mode");

    // 👇 Make labels readable in dark mode
    detailsContent.querySelectorAll('.rating-display span, .favorite-display span, .details-grid span').forEach(el => el.style.color = "#dcdce6");

} else {
    detailsContent.classList.remove("dark-mode");

    // 👇 Reset labels back for light mode
    detailsContent.querySelectorAll('.rating-display span, .favorite-display span, .details-grid span').forEach(el => el.style.color = "#374151");
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

  // Initialize rating stars after modal is shown
  setTimeout(() => {
    initializeRatingStars();
  }, 100);

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
  
  // Reset rating
  document.getElementById("rating").value = 0;
  updateStarsDisplay(0);
  
  // Reset favorite
  document.getElementById("isFavorite").checked = false;
}

// Edit paper
function editPaper(id) {
  editingPaper = papers.find((p) => p.id === id);
  if (!editingPaper) return;

  document.getElementById("modalOverlay").classList.remove("hidden");
  document.getElementById("modalTitle").textContent = "Edit Paper";
  document.getElementById("submitText").textContent = "Update Paper";

  // Initialize rating stars for edit modal
  setTimeout(() => {
    initializeRatingStars();
  }, 100);

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

  // Set rating
  const rating = editingPaper.rating || 0;
  document.getElementById("rating").value = rating;
  updateStarsDisplay(rating);

  // Set favorite
  document.getElementById("isFavorite").checked = editingPaper.isFavorite || false;

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

// Toggle favorite status
function toggleFavorite(id) {
  const paper = papers.find((p) => p.id === id);
  if (paper) {
    paper.isFavorite = !paper.isFavorite;
    saveToStorage();
    renderPapers();
    if (selectedPaper && selectedPaper.id === id) {
      selectedPaper = paper;
      showPaperDetails();
    }
  }
}

// Quick rating function for paper cards
function setQuickRating(paperId, rating) {
  const paper = papers.find((p) => p.id === paperId);
  if (paper) {
    paper.rating = rating;
    saveToStorage();
    renderPapers();
    if (selectedPaper && selectedPaper.id === paperId) {
      selectedPaper = paper;
      showPaperDetails();
    }
    
    // Show feedback
    const paperCard = document.querySelector(`[onclick*="selectPaper(${paperId})"]`);
    if (paperCard) {
      paperCard.style.transform = 'scale(1.02)';
      setTimeout(() => {
        paperCard.style.transform = 'scale(1)';
      }, 200);
    }
  }
}

// Rating functionality
function updateStarsDisplay(rating) {
  const stars = document.querySelectorAll('.star');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < rating);
  });
}

function setRating(rating) {
  document.getElementById('rating').value = rating;
  updateStarsDisplay(rating);
}

// Initialize rating star event listeners
function initializeRatingStars() {
  const stars = document.querySelectorAll('.star');
  
  // Remove existing event listeners to avoid duplicates
  stars.forEach(star => {
    star.replaceWith(star.cloneNode(true));
  });
  
  // Re-query stars after cloning
  const newStars = document.querySelectorAll('.star');
  
  newStars.forEach((star, index) => {
    star.addEventListener('click', () => {
      setRating(index + 1);
    });
    
    star.addEventListener('mouseenter', () => {
      newStars.forEach((s, i) => {
        s.classList.toggle('hover', i <= index);
      });
    });
    
    star.addEventListener('mouseleave', () => {
      newStars.forEach(s => s.classList.remove('hover'));
    });
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
    rating: parseInt(document.getElementById("rating").value) || 0,
    isFavorite: document.getElementById("isFavorite").checked,
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
  const theme = localStorage.getItem('darkMode');
  if (theme === 'enabled') {
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
    localStorage.setItem('darkMode', isNowDark ? "enabled" : "disabled");
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

// clearPdfBtn.addEventListener("click", function () {
//   clearPdfData();
// });

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

// Drag & Drop + Click Upload + Autofill
document.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    const fileInput = document.getElementById("pdfUpload");
    const uploadedFile = document.getElementById("uploaded-file");

    // Handle clicking on drop zone to open file picker
    dropZone.addEventListener("click", () => {
        fileInput.click();
    });

    // Highlight drop zone on drag enter / over
    ["dragenter", "dragover"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.add("dragover");
        });
    });

    // Remove highlight on drag leave / drop
    ["dragleave", "drop"].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropZone.classList.remove("dragover");
        });
    });

    // Handle file drop
    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    // Handle file selection from input
    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });

    // Function to handle the selected PDF
    function handleFile(file) {
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file.");
      return;
    }

    console.log("File uploaded:", file.name, file.size, "bytes");

    const reader = new FileReader();
    reader.onload = function (e) {
      uploadedPdfData = e.target.result; // base64 string
      uploadedFile.style.display = "flex";
      uploadedFile.innerHTML = `
        <div class="uploaded-file-row" style="display:flex; align-items:center; padding:5px; border-radius:5px; margin-top:5px;">
          <div style="display:flex; align-items:center; flex:1; min-width:0;">
            <i class="fas fa-light fa-file-pdf" style="color:#e63946; margin-left:10px; margin-right:10px;"></i> 
            <span style="flex:1; font-style:italic; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:450px; display:inline-block;">
              ${file.name}
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-left:10px; margin-right:10px; flex-shrink:0;">
            <button id="autofill-btn" type="button" style="cursor:pointer; background: #2563eb; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-size: 0.875rem;">Autofill</button>
            <i class="fas fa-eye-slash" id="preview-pdf" style="cursor:pointer;"></i>
            <i class="fa-solid fa-trash" id="delete-pdf" style="cursor:pointer;"></i>
          </div>
        </div>
      `;

      //autofill working
      const autofillBtn = document.getElementById("autofill-btn");
      autofillBtn.addEventListener("click", async () => {
          if (!file) {
              alert("No PDF file found.");
              return;
          }

          const formData = new FormData();
          formData.append("file", file);

          try {
              const response = await fetch("http://127.0.0.1:5000/extract_metadata", {
                  method: "POST",
                  body: formData
              });

              const data = await response.json();

              if (data.error) {
                  alert("Unable to extract metadata. Please fill manually.");

                  //Clear old values if nothing found
                  document.getElementById("title").value = "";
                  document.getElementById("authors").value = "";
                  document.getElementById("year").value = "";
                  document.getElementById("journal").value = "";
                  document.getElementById("tags").value = "";
                  return;
              }

              //Fill form fields if available
              document.getElementById("title").value = data.title || "";
              document.getElementById("authors").value = data.authors || "";
              document.getElementById("year").value = data.year || "";
              document.getElementById("journal").value = data.journal || "";
              document.getElementById("tags").value = data.keywords || "";

          } catch (err) {
              console.error(err);
              alert("Error extracting metadata. Please try manually.");
          }
      });


      const eyeIcon = document.getElementById("preview-pdf");
      let isVisible = true;

      eyeIcon.addEventListener("click", () => {
        if (!isVisible) {
          showPdfPreview(uploadedPdfData); // show preview
          eyeIcon.classList.remove("fa-eye");
          eyeIcon.classList.add("fa-eye-slash");
          isVisible = true;
        } else {
          showPdfPreview(null); // hide preview
          eyeIcon.classList.remove("fa-eye-slash");
          eyeIcon.classList.add("fa-eye");
          isVisible = false;
        }
      });

      const deleteIcon = document.getElementById("delete-pdf");
      deleteIcon.addEventListener("click", () => {
        clearPdfData(); // resets input + preview
        uploadedFile.innerHTML = ""; // remove filename + icons

        document.getElementById("title").value = "";
        document.getElementById("authors").value = "";
        document.getElementById("year").value = "";
        document.getElementById("journal").value = "";
        document.getElementById("tags").value = "";
      });
    };
    reader.readAsDataURL(file);
  }
});


// Logic for exporting and importing the papers
function exportPapers() {
  const papers = JSON.parse(localStorage.getItem('papers') || '[]');
  const blob = new Blob([JSON.stringify(papers, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'papers.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importPapers() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json';

  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          localStorage.setItem('papers', JSON.stringify(imported));
          location.reload();
        } else {
          alert('Invalid file format.');
        }
      } catch {
        alert('Error reading file.');
      }
    };
    reader.readAsText(file);
  };

  input.click();
}

//Calendar Logic 
function populateYearSelect(id, startYear, endYear) {
        const select = document.getElementById(id);
        for (let year = startYear; year >= endYear; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            select.appendChild(option);
        }
    }


    // Populate both dropdowns from 2050 → 1950
    populateYearSelect("minYear", 2050, 1950);
    populateYearSelect("maxYear", 2050, 1950);

// Get the button
const backToTopBtn = document.getElementById("backToTop");

// Show button when scrolled down
window.onscroll = function () {
  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
};

// Smooth scroll to top
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

// Custom chatbot functionality removed - now using Chatbase integration

async function getSuggestedTags(title, abstract) {
  try {
    const response = await fetch("/api/research-papers/suggest-tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, abstract })
    });
    if (!response.ok) throw new Error("Failed to get tag suggestions");
    const data = await response.json();
    return data.suggestedTags || [];
  } catch (err) {
    alert("Error getting tag suggestions: " + err.message);
    return [];
  }
}
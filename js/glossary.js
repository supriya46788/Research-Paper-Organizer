const glossaryTerms = [
  { term: "Abstract", definition: "A summary of the research paper.", example: "The abstract outlined the study's objectives and results." },
  { term: "Peer Review", definition: "The evaluation of academic work by others in the same field.", example: "The paper underwent peer review before publication." },
  { term: "Citation", definition: "A reference to a published or unpublished source.", example: "The paper included citations to relevant literature." },
  { term: "DOI", definition: "Digital Object Identifier, a unique alphanumeric string for a document.", example: "The DOI ensured readers could locate the article online." },
  { term: "Hypothesis", definition: "A proposed explanation for a phenomenon.", example: "The hypothesis was tested through multiple experiments." },
  { term: "Literature Review", definition: "A survey of scholarly sources relevant to a topic.", example: "The literature review provided context for the study." },
  { term: "Plagiarism", definition: "Using someone else's work without proper attribution.", example: "The author avoided plagiarism by citing all sources." },
  { term: "Impact Factor", definition: "A measure of a journal's influence.", example: "The journal had an impact factor of 5.2." },
  { term: "Open Access", definition: "Research available without subscription fees.", example: "The paper was published in an open-access journal." },
  { term: "Research Methodology", definition: "The strategy and process used to conduct research.", example: "The research methodology included surveys and interviews." }
];

// Select glossary container
const glossaryContainer = document.querySelector(".glossary-container");

// Render glossary terms
glossaryTerms.forEach(item => {
  const card = document.createElement("div");
  card.classList.add("glossary-item"); // ✅ use glossary-item everywhere
  card.setAttribute("id", item.term.charAt(0).toUpperCase()); // so alphabet nav works
  card.innerHTML = `
    <h2>${item.term}</h2>
    <p>${item.definition}</p>
    <small><strong>Example:</strong> ${item.example}</small>
  `;
  glossaryContainer.appendChild(card);
});

// 🔎 Search functionality
// Search functionality
const searchInput = document.querySelector(".glossary-header input");
searchInput.addEventListener("input", function() {
    const searchTerm = searchInput.value.toLowerCase();
    const glossaryItems = document.querySelectorAll(".glossary-item"); // FIXED
    glossaryItems.forEach(item => {
        const term = item.querySelector("h2").textContent.toLowerCase(); // you used <h3>, not <h2>
        if (term.includes(searchTerm)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
});


// 🔤 Alphabet navigation
const alphabetLinks = document.querySelectorAll(".alphabet-nav a");
alphabetLinks.forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetItem = document.getElementById(targetId);
    if (targetItem) {
      targetItem.scrollIntoView({ behavior: "smooth" });
    }
  });
});

// 🔠 Highlight current section in alphabet navigation
window.addEventListener("scroll", function() {
  const scrollPosition = window.scrollY;
  alphabetLinks.forEach(link => {
    const targetId = link.getAttribute("href").substring(1);
    const targetItem = document.getElementById(targetId);
    if (targetItem) {
      const itemPosition = targetItem.offsetTop;
      const itemHeight = targetItem.offsetHeight;
      if (scrollPosition >= itemPosition && scrollPosition < itemPosition + itemHeight) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    }
  });
});

// 🔝 Back to top button
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    backToTop.style.display = "block";
  } else {
    backToTop.style.display = "none";
  }
});
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Mobile menu toggle
document.querySelector(".mobile-menu-toggle").addEventListener("click", () => {
  document.querySelector(".nav-links").classList.toggle("active");
});



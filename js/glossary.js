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
  card.classList.add("glossary-card");
  card.innerHTML = `
    <h3>${item.term}</h3>
    <p>${item.definition}</p>
    <small><strong>Example:</strong> ${item.example}</small>
  `;
  glossaryContainer.appendChild(card);
});
// Search functionality
const searchInput = document.querySelector(".glossary-header input");
searchInput.addEventListener("input", function() {
    const searchTerm = searchInput.value.toLowerCase();
    const glossaryItems = document.querySelectorAll(".glossary-item");
    glossaryItems.forEach(item => {
        const term = item.querySelector("h2").textContent.toLowerCase();
        if (term.includes(searchTerm)) {
            item.classList.add("visible");
        } else {
            item.classList.remove("visible");
        }
    });
});
// Alphabet navigation
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

// Highlight current section in alphabet navigation

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
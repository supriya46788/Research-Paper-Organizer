function filterPapers(tag) {
  const papers = document.querySelectorAll(".paper");
  const filterButtons = document.querySelectorAll(".filter-btn");
  
  // Update active button
  filterButtons.forEach(btn => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-filter") === tag) {
      btn.classList.add("active");
    }
  });
  
  // Filter papers
  papers.forEach((paper) => {
    const tags = paper.getAttribute("data-tags").split(" ");
    paper.style.display = tag === "all" || tags.includes(tag) ? "flex" : "none";
  });
}

// Dark mode toggle
// const darkToggle = document.getElementById('darkToggle');
// darkToggle.addEventListener('click', () => {
//   document.body.classList.toggle('dark');
//   darkToggle.textContent = document.body.classList.contains('dark')
//     ? '☀️'
//     : '🌙';
// });

// 🌙 Dark Mode Toggle
function toggleDarkMode() {
  const body = document.body;
  const darkToggle = document.getElementById('darkModeToggle');
  const icon = darkToggle.querySelector('i');
  
  body.classList.toggle('dark-mode');
  
  // Update icon
  if (body.classList.contains('dark-mode')) {
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
    localStorage.setItem('darkMode', 'disabled');
  }
}

// Load dark mode preference on page load
document.addEventListener('DOMContentLoaded', function() {
  const darkMode = localStorage.getItem('darkMode');
  const darkToggle = document.getElementById('darkModeToggle');
  const icon = darkToggle.querySelector('i');
  
  if (darkMode === 'enabled') {
    document.body.classList.add('dark-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
  }
});

// Hamburger menu toggle
function toggleMenu() {
  const nav = document.querySelector(".navbar-right-links");
  nav.classList.toggle("show");
}
// Dummy Tag Suggestion
// function showTagSuggestions() {
//   const title = document.getElementById("paperTitle").value;
//   const abstract = document.getElementById("paperAbstract").value;
//   const suggestions = [];
//   if (/AI|artificial/i.test(title + abstract)) suggestions.push("AI");
//   if (/machine learning|ML/i.test(title + abstract))
//     suggestions.push("ML");
//   if (/vision|image|object/i.test(title + abstract))
//     suggestions.push("CV");
//   if (/NLP|language|text/i.test(title + abstract))
//     suggestions.push("NLP");
//   if (/robot/i.test(title + abstract)) suggestions.push("Robotics");
//   if (/health|medical|patient/i.test(title + abstract))
//     suggestions.push("Healthcare");
//   if (/data|analytics|big/i.test(title + abstract))
//     suggestions.push("DataScience");
//   document.getElementById("tagSuggestions").textContent =
//     suggestions.length
//       ? "Suggested Tags: " + suggestions.join(", ")
//       : "No suggestions found.";
// }

// Scrolling Button
const bottomToTopButton = document.getElementById("backToTop");
const icon = bottomToTopButton.querySelector("i");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    bottomToTopButton.classList.add("show");

    if (
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 10
    ) {
      icon.classList.replace("fa-arrow-down", "fa-arrow-up");
    } else {
      icon.classList.replace("fa-arrow-up", "fa-arrow-down");
    }
  } else {
    bottomToTopButton.classList.remove("show");
  }
});

bottomToTopButton.addEventListener("click", () => {
  if (icon.classList.contains("fa-arrow-down")) {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

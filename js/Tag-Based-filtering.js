function filterPapers(tag) {
  const papers = document.querySelectorAll(".paper");
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
const darkToggle = document.getElementById("darkModeToggle");
const body = document.body;

// Load preference
if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
  darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Toggle event
darkToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    localStorage.setItem("darkMode", "disabled");
    darkToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
});
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

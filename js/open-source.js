function toggleMenu() {
    const navbarRightLinks = document.querySelector('.navbar-right-links');
    navbarRightLinks.classList.toggle('show');
}

const githubUser = "supriya46788";
let allRepos = [];

async function fetchRepos() {
    const res = await fetch(
        `https://api.github.com/users/${githubUser}/repos?per_page=12&sort=updated`
    );
    const data = await res.json();
    allRepos = data.map((repo) => ({
        name: repo.name,
        desc: repo.description || "No description",
        url: repo.html_url,
        language: repo.language ? repo.language.toLowerCase() : "other",
        tags: repo.language ? [repo.language.toLowerCase()] : ["other"],
    }));
    displayRepos(allRepos);
}

function displayRepos(list) {
    const container = document.getElementById("repo-container");
    container.innerHTML = "";
    list.forEach((repo) => {
        container.innerHTML += `
      <div class="repo">
        <h3>${repo.name}</h3>
        <p>${repo.desc}</p>
        <div class="tags">${repo.tags
                .map((t) => `<span>${t.toUpperCase()}</span>`)
                .join("")}</div>
        <a href="${repo.url}" target="_blank">🔗 View Repo</a>
      </div>`;
    });
}

function searchRepos() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    displayRepos(
        allRepos.filter(
            (r) =>
                r.name.toLowerCase().includes(term) || r.language.includes(term)
        )
    );
}

function filterRepos(tag) {
    if (tag === "all") displayRepos(allRepos);
    else displayRepos(allRepos.filter((r) => r.tags.includes(tag)));
}

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

//Scroll to back & top button
// Show button when scrolled down
const bottomToTopButton = document.getElementById("backToTop");
const icon = bottomToTopButton.querySelector("i");

window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
        bottomToTopButton.style.display = "block";

        if (
            window.scrollY + window.innerHeight >=
            document.documentElement.scrollHeight - 10
        ) {
            icon.classList.remove("fa-arrow-down");
            icon.classList.add("fa-arrow-up");
        } else {
            icon.classList.remove("fa-arrow-up");
            icon.classList.add("fa-arrow-down");
        }
    } else {
        bottomToTopButton.style.display = "none";
    }
});

bottomToTopButton.addEventListener("click", () => {
    if (icon.classList.contains("fa-arrow-down")) {
        // scroll to bottom
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    } else {
        // scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

fetchRepos();
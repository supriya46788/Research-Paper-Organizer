// Hamburger toggle
function toggleMenu() {
    const nav = document.querySelector(".navbar-right-links");
    nav.classList.toggle("show");
}

// Dark Mode Toggle
function toggleDarkMode() {
    const body = document.body;
    const darkToggle = document.getElementById('darkModeToggle');
    const icon = darkToggle.querySelector('i');
    
    body.classList.toggle('dark-mode');
    
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

// Load dark mode preference
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

// FAQ Hover Logic
document.querySelectorAll(".faq-item").forEach(item => {
    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("mouseenter", () => {
        // Close other items
        document.querySelectorAll(".faq-item").forEach(f => {
            if (f !== item) {
                f.classList.remove("active");
                f.querySelector(".faq-answer").style.maxHeight = null;
            }
        });

        // Open this item
        item.classList.add("active");

        // Set exact scrollHeight for smooth expansion
        answer.style.maxHeight = answer.scrollHeight + "px";
    });

    question.addEventListener("mouseleave", () => {
        item.classList.remove("active");
        answer.style.maxHeight = null;
    });
});


// Back to Top Button
const backToTop = document.getElementById("backToTop");
const icon = backToTop.querySelector("i");

window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
        backToTop.style.display = "block";
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 10) {
            icon.classList.remove("fa-arrow-down");
            icon.classList.add("fa-arrow-up");
        } else {
            icon.classList.remove("fa-arrow-up");
            icon.classList.add("fa-arrow-down");
        }
    } else {
        backToTop.style.display = "none";
    }
});

backToTop.addEventListener("click", () => {
    if (icon.classList.contains("fa-arrow-down")) {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});

// Chatbase Integration
(function(){
    if(!window.chatbase || window.chatbase("getState") !== "initialized"){
        window.chatbase = (...arguments) => {
            if(!window.chatbase.q){ window.chatbase.q = [] }
            window.chatbase.q.push(arguments)
        };
        window.chatbase = new Proxy(window.chatbase, {
            get(target, prop) {
                if(prop === "q"){ return target.q }
                return (...args) => target(prop, ...args)
            }
        });
    }
    const onLoad = function(){
        const script = document.createElement("script");
        script.src = "https://www.chatbase.co/embed.min.js";
        script.id = "ubDfCZ-KoiucQjQos4LDA";
        script.domain = "www.chatbase.co";
        document.body.appendChild(script)
    };
    if(document.readyState === "complete"){ onLoad() }
    else { window.addEventListener("load", onLoad) }
})();

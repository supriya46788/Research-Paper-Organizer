// Landing Page JavaScript
document.addEventListener("DOMContentLoaded", function () {

  // Smooth scroll for anchor links
  function scrollToFeatures() {
    document.getElementById("features").scrollIntoView({
      behavior: "smooth",
    });
  }

  // Add scroll effect to navigation
  window.addEventListener("scroll", function () {
    const nav = document.querySelector(".landing-nav");
    if (window.scrollY > 100) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  });

  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, observerOptions);

  // Observe all elements with fade-in class
  document.querySelectorAll(".fade-in").forEach((el) => {
    observer.observe(el);
  });

  // Add fade-in class to feature cards, steps, and stats
  document
    .querySelectorAll(".feature-card, .step, .stat-item")
    .forEach((el) => {
      el.classList.add("fade-in");
    });

  // Check if user is already logged in
  function checkAuthStatus() {
    const currentUser = localStorage.getItem("current_user");
    if (currentUser) {
      // User is logged in, redirect to app
      window.location.href = "home.html";
    }
  }

  // Run auth check on page load
  checkAuthStatus();

  // Handle navigation buttons
  document.querySelectorAll('[onclick*="location.href"]').forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("onclick").match(/'([^']+)'/)[1];
      if (href === "index.html") {
        // Check auth before redirecting to app
        checkAuthStatus();
      } else {
        window.location.href = href;
      }
    });
  });
});
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
  let start = 0;
  const duration = 2000; // 2 seconds
  const step = (timestamp) => {
    if (!el.startTime) el.startTime = timestamp;
    const progress = Math.min((timestamp - el.startTime) / duration, 1);
    const value = (progress * target).toFixed(decimals);
    el.textContent = value + (decimals === 0 ? '+' : '');
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.stats').forEach(section => observer.observe(section));

// Utility functions
function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({
    behavior: "smooth",
  });
}

// Add loading states for buttons
function addLoadingState(button) {
  const originalText = button.innerHTML;
  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  }, 2000);
}

// Form validation for email capture (if needed)
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Add to global scope for inline onclick handlers
window.scrollToFeatures = function () {
  document.getElementById("features").scrollIntoView({
    behavior: "smooth",
  });
};

// Landing Page JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('mobile-active');
        });
    }

    // Smooth scroll for anchor links
    function scrollToFeatures() {
        document.getElementById('features').scrollIntoView({
            behavior: 'smooth'
        });
    }

    // Add scroll effect to navigation
    window.addEventListener('scroll', function() {
        const nav = document.querySelector('.landing-nav');
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all elements with fade-in class
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });

    // Add fade-in class to elements
    document.querySelectorAll('.feature-card, .step, .stat-item').forEach(el => {
        el.classList.add('fade-in');
    });

    // Check if user is already logged in
    function checkAuthStatus() {
        const currentUser = localStorage.getItem('current_user');
        if (currentUser) {
            // User is logged in, redirect to app
            window.location.href = 'home.html';
        }
    }

    // Run auth check on page load
    checkAuthStatus();

    // Handle navigation buttons
    document.querySelectorAll('[onclick*="location.href"]').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('onclick').match(/'([^']+)'/)[1];
            if (href === 'index.html') {
                // Check auth before redirecting to app
                checkAuthStatus();
            } else {
                window.location.href = href;
            }
        });
    });
});

// Utility functions
function scrollToSection(sectionId) {
    document.getElementById(sectionId).scrollIntoView({
        behavior: 'smooth'
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
window.scrollToFeatures = function() {
    document.getElementById('features').scrollIntoView({
        behavior: 'smooth'
    });
};
// Dark Mode Toggle with localStorage
const toggle = document.getElementById('darkModeToggle');
const body = document.body;

// Load saved preference
if (localStorage.getItem('darkMode') === 'enabled') {
  body.classList.add('dark-mode');
  toggle.checked = true;
}

toggle.addEventListener('change', () => {
  if (toggle.checked) {
    body.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
  } else {
    body.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
  }
});

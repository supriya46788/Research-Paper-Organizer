// Unified Mobile Navigation JavaScript

class MobileNavigation {
  constructor() {
    this.hamburgerMenu = document.querySelector('.hamburger-menu');
    this.mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    this.mobileMenuContainer = document.querySelector('.mobile-menu-container');
    this.mobileMenuClose = document.querySelector('.mobile-menu-close');
    this.mobileMenuLinks = document.querySelectorAll('.mobile-menu-links .nav-item');
    
    this.init();
  }

  init() {
    if (this.hamburgerMenu) {
      this.hamburgerMenu.addEventListener('click', () => this.openMenu());
    }
    
    if (this.mobileMenuClose) {
      this.mobileMenuClose.addEventListener('click', () => this.closeMenu());
    }
    
    if (this.mobileMenuOverlay) {
      this.mobileMenuOverlay.addEventListener('click', (e) => {
        if (e.target === this.mobileMenuOverlay) {
          this.closeMenu();
        }
      });
    }
    
    // Close menu when clicking on any menu link
    this.mobileMenuLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMenu();
      }
    });
    
    // Close menu on window resize if screen becomes larger
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeMenu();
      }
    });
  }

  openMenu() {
    if (this.hamburgerMenu) {
      this.hamburgerMenu.classList.add('active');
    }
    if (this.mobileMenuOverlay) {
      this.mobileMenuOverlay.classList.add('active');
    }
    if (this.mobileMenuContainer) {
      this.mobileMenuContainer.classList.add('active');
    }
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  closeMenu() {
    if (this.hamburgerMenu) {
      this.hamburgerMenu.classList.remove('active');
    }
    if (this.mobileMenuOverlay) {
      this.mobileMenuOverlay.classList.remove('active');
    }
    if (this.mobileMenuContainer) {
      this.mobileMenuContainer.classList.remove('active');
    }
    document.body.style.overflow = ''; // Restore scrolling
  }
}

// Initialize mobile navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new MobileNavigation();
});

// Function to create mobile menu HTML structure
function createMobileMenuStructure() {
  const mobileMenuHTML = `
    <div class="mobile-menu-overlay">
      <div class="mobile-menu-container">
        <div class="mobile-menu-header">
          <h3><i class="fas fa-book-open"></i> Menu</h3>
          <button class="mobile-menu-close" aria-label="Close menu">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="mobile-menu-links">
          <a href="home.html" class="nav-item">
            <i class="fas fa-home"></i>
            Home
          </a>
          <a href="about.html" class="nav-item">
            <i class="fas fa-info-circle"></i>
            About Us
          </a>
          <a href="blog.html" class="nav-item">
            <i class="fas fa-blog"></i>
            Blog
          </a>
          <a href="Faq.html" class="nav-item">
            <i class="fas fa-question-circle"></i>
            FAQ
          </a>
          <a href="contact.html" class="nav-item">
            <i class="fas fa-envelope"></i>
            Contact Us
          </a>
          <a href="tools.html" class="nav-item">
            <i class="fas fa-tools"></i>
            Tools
          </a>
          <a href="glossary.html" class="nav-item">
            <i class="fas fa-book"></i>
            Glossary
          </a>
          <a href="open-source.html" class="nav-item">
            <i class="fab fa-github"></i>
            Open Source
          </a>
        </div>
      </div>
    </div>
  `;
  
  return mobileMenuHTML;
}

// Function to update navigation for current page
function updateNavigationForCurrentPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'home.html';
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPage || (currentPage === 'index.html' && href === 'home.html')) {
      item.style.background = '#1d4ed8';
      item.style.transform = 'scale(1.05)';
    }
  });
}

// Export functions for use in other scripts
window.MobileNavigation = MobileNavigation;
window.createMobileMenuStructure = createMobileMenuStructure;
window.updateNavigationForCurrentPage = updateNavigationForCurrentPage;

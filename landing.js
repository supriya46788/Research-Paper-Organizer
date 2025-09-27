import React, { useEffect } from "react";
import "./App.css";

function App() {
  useEffect(() => {
    // ===== Slider Functionality =====
    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");
    const slider = document.querySelector(".slider");
    const sliderList = slider.querySelector(".list");
    const thumbnail = document.querySelector(".slider .thumbnail");
    const thumbnailItems = thumbnail.querySelectorAll(".item");

    if (thumbnailItems.length > 0) thumbnail.appendChild(thumbnailItems[0]);

    let autoSlideInterval = 3000;
    let autoSlideTimer;

    function startAutoSlide() {
      autoSlideTimer = setInterval(() => moveSlider("next"), autoSlideInterval);
    }

    function resetAutoSlide() {
      clearInterval(autoSlideTimer);
      startAutoSlide();
    }

    function moveSlider(direction) {
      const sliderItems = sliderList.querySelectorAll(".item");
      const thumbItems = document.querySelectorAll(".thumbnail .item");

      if (direction === "next") {
        sliderList.appendChild(sliderItems[0]);
        thumbnail.appendChild(thumbItems[0]);
        slider.classList.add("next");
      } else {
        sliderList.prepend(sliderItems[sliderItems.length - 1]);
        thumbnail.prepend(thumbItems[thumbItems.length - 1]);
        slider.classList.add("prev");
      }

      slider.addEventListener(
        "animationend",
        () => {
          slider.classList.remove(direction === "next" ? "next" : "prev");
        },
        { once: true }
      );
    }

    nextBtn?.addEventListener("click", () => {
      moveSlider("next");
      resetAutoSlide();
    });

    prevBtn?.addEventListener("click", () => {
      moveSlider("prev");
      resetAutoSlide();
    });

    startAutoSlide();

    // ===== Smooth Scroll Functions =====
    const scrollToSection = (id) => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    window.scrollToFeatures = () => scrollToSection("features");
    window.scrollToHowItWorks = () => scrollToSection("how-it-works");

    // ===== Scroll Effects =====
    const nav = document.querySelector(".landing-nav");
    const handleNavScroll = () => {
      if (window.scrollY > 100) nav?.classList.add("scrolled");
      else nav?.classList.remove("scrolled");
    };
    window.addEventListener("scroll", handleNavScroll);

    // ===== Fade-in Animations =====
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -50px 0px" };
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("visible");
      });
    }, observerOptions);

    document.querySelectorAll(".fade-in").forEach((el) => fadeObserver.observe(el));

    document
      .querySelectorAll(".feature-card, .step, .stat-item")
      .forEach((el) => el.classList.add("fade-in"));

    // ===== Stats Counters =====
    function animateCounter(el) {
      const target = parseFloat(el.dataset.target);
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      let start = 0;
      const duration = 2000;

      const step = (timestamp) => {
        if (!el.startTime) el.startTime = timestamp;
        const progress = Math.min((timestamp - el.startTime) / duration, 1);
        const value = (progress * target).toFixed(decimals);
        el.textContent = value + (decimals === 0 ? "+" : "");
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            entry.target.querySelectorAll(".stat-number").forEach(animateCounter);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    document.querySelectorAll(".stats").forEach((section) => statsObserver.observe(section));

    // ===== Auth Check =====
    const checkAuthStatus = () => {
      const currentUser = localStorage.getItem("current_user");
      if (currentUser) window.location.href = "home.html";
    };
    checkAuthStatus();

    // ===== Button Click Redirects with Auth Check =====
    document.querySelectorAll('[onclick*="location.href"]').forEach((button) => {
      button.addEventListener("click", (e) => {
        e.preventDefault();
        const href = button.getAttribute("onclick").match(/'([^']+)'/)[1];
        if (href === "index.html") checkAuthStatus();
        else window.location.href = href;
      });
    });

    // ===== Utility Functions =====
    const addLoadingState = (button) => {
      const originalText = button.innerHTML;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
      button.disabled = true;
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
      }, 2000);
    };

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    // Cleanup listeners on unmount
    return () => {
      clearInterval(autoSlideTimer);
      window.removeEventListener("scroll", handleNavScroll);
    };
  }, []);

  return (
    <div className="App">
      {/* ✅ Navbar Section */}
      <nav className="landing-nav">
        <div className="nav-container">
          <a href="/" className="nav-brand">
            <img id="logo" src="/images/logo.png" alt="Research Paper Organizer Logo" />
            Research Paper Organizer
          </a>

          {/* Mobile Menu Toggle */}
          <button className="mobile-menu-toggle" aria-label="Toggle navigation menu">
            <i className="fas fa-bars" role="img" aria-label="Menu icon"></i>
          </button>

          {/* Navigation Links */}
          <div className="nav-links">
            <a href="#features" aria-label="View features">Features</a>
            <a href="#how-it-works" aria-label="See how it works">How It Works</a>
            <a href="/login" aria-label="Login to your account">Login</a>
          </div>
        </div>
      </nav>

      {/* Slider Section */}
      <div className="slider">
        <div className="list">
          <div className="item">
            <img src="/images/slide1.jpg" alt="Slide 1" />
          </div>
          <div className="item">
            <img src="/images/slide2.jpg" alt="Slide 2" />
          </div>
          <div className="item">
            <img src="/images/slide3.jpg" alt="Slide 3" />
          </div>
        </div>

        {/* Slider Buttons */}
        <button className="prev" aria-label="Previous slide">⟨</button>
        <button className="next" aria-label="Next slide">⟩</button>

        {/* Thumbnails */}
        <div className="thumbnail">
          <div className="item">
            <img src="/images/slide1-thumb.jpg" alt="Thumbnail 1" />
          </div>
          <div className="item">
            <img src="/images/slide2-thumb.jpg" alt="Thumbnail 2" />
          </div>
          <div className="item">
            <img src="/images/slide3-thumb.jpg" alt="Thumbnail 3" />
          </div>
        </div>
      </div>

      {/* Sections */}
      <section id="features" className="feature-card">Features Section</section>
      <section id="how-it-works" className="step">How It Works Section</section>
      <section className="stats">
        <div className="stat-item">
          <span className="stat-number" data-target="5000"></span>
          <span>Users</span>
        </div>
      </section>
    </div>
  );
}

export default App;

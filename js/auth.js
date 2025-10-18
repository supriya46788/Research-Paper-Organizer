// Authentication system using localStorage
const USERS_KEY = "research_organizer_users";
const CURRENT_USER_KEY = "current_user";
const THEME_KEY = "theme"; // Add theme key

// === Google Sign-in via Backend OAuth ===
// Configure your backend base URL here
const API_BASE = (window.AUTH_API_BASE) || "http://localhost:3000";

// Hook up the Google button to backend OAuth
(function attachGoogleSignIn() {
  const googleBtn = document.querySelector(".google-btn");
  if (!googleBtn) return;
  googleBtn.addEventListener("click", () => {
    try {
      // Redirect to backend OAuth route
      window.location.href = `${API_BASE}/api/auth/google`;
    } catch (err) {
      console.error("Google sign-in redirect failed:", err);
      alert("Google sign-in failed");
    }
  });
})();

class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.initializeEventListeners();
    this.applyThemeFromStorage(); // Apply theme on load
    this.setupDarkModeToggle(); // Add dark mode toggle to auth pages
  }

  // Apply stored theme preference
  applyThemeFromStorage() {
    const theme = localStorage.getItem(THEME_KEY);
    if (theme === "dark") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }

  // Add dark mode toggle to auth pages
  setupDarkModeToggle() {
    const authHeader = document.querySelector(".auth-header");
    if (authHeader) {
      const darkModeToggle = document.createElement("button");
      darkModeToggle.className = "auth-dark-toggle";
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeToggle.onclick = () => this.toggleDarkMode();

      // Position it in the top-right corner
      darkModeToggle.style.position = "absolute";
      darkModeToggle.style.top = "1rem";
      darkModeToggle.style.right = "1rem";

      // Make the auth-card relative positioned
      document.querySelector(".auth-card").style.position = "relative";
      document.querySelector(".auth-card").appendChild(darkModeToggle);

      // Update icon based on current theme
      this.updateDarkModeIcon();
    }
  }

  toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle("dark-mode");
    localStorage.setItem(THEME_KEY, isDarkMode ? "dark" : "light");
    this.updateDarkModeIcon();
  }

  updateDarkModeIcon() {
    const toggle = document.querySelector(".auth-dark-toggle i");
    const isDark = document.body.classList.contains("dark-mode");

    if (toggle) {
      if (isDark) {
        toggle.classList.remove("fa-moon");
        toggle.classList.add("fa-sun");
      } else {
        toggle.classList.remove("fa-sun");
        toggle.classList.add("fa-moon");
      }
    }
  }

  loadUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  saveUsers() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this.users));
  }

  getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  clearCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
  }

  initializeEventListeners() {
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    const signupForm = document.getElementById("signupForm");
    if (signupForm) {
      signupForm.addEventListener("submit", (e) => this.handleSignup(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const rememberMe = document.getElementById("rememberMe").checked;

    if (!email || !password) {
      this.showError("Please fill in all fields");
      return;
    }

    const user = this.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user || user.password !== password) {
      this.showError("Invalid email or password");
      return;
    }

    this.setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      rememberMe,
    });

    this.showSuccess("Login successful!", () => {
      window.location.href = "index.html";
    });
  }

  async handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const submitButton = e.target.querySelector('button[type="submit"]');

    if (this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      this.showError("User with this email already exists");
      return;
    }
    const validDomains = [
      "gmail.com",
      "yahoo.com",
      "outlook.com",
      "hotmail.com",
    ];

    // Extract domain
    const emailDomain = email.split("@")[1];

    //  Reject wrong / fake domains like gml.com, yahhoo.com
    if (!emailDomain || !validDomains.includes(emailDomain.toLowerCase())) {
      this.showError(
        `Invalid email domain. Please use: ${validDomains.join(", ")}`
      );
      return;
    }

    // Check duplicate user
    if (this.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      this.showError("User with this email already exists");
      return;
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.innerHTML =
        '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();

    setTimeout(() => {
      this.showSuccess("Account created successfully!", () => {
        window.location.href = "index.html";
      });
    }, 1500);
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: message,
      confirmButtonColor: "#dc2626",
      background: document.body.classList.contains("dark-mode")
        ? "#1f2937"
        : "#ffffff",
      color: document.body.classList.contains("dark-mode")
        ? "#f3f4f6"
        : "#1f2937",
    });
  }

  showSuccess(message, callback) {
    Swal.fire({
      icon: "success",
      title: "Success",
      text: message,
      confirmButtonColor: "#059669",
      timer: 2000,
      timerProgressBar: true,
      background: document.body.classList.contains("dark-mode")
        ? "#1f2937"
        : "#ffffff",
      color: document.body.classList.contains("dark-mode")
        ? "#f3f4f6"
        : "#1f2937",
    }).then(() => {
      if (callback) callback();
    });
  }
}

window.togglePassword = togglePassword;

// Password toggle functionality
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.parentElement.querySelector(".password-toggle i");

  if (input.type === "password") {
    input.type = "text";
    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");
  } else {
    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new AuthSystem();
});

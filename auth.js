// Authentication system using localStorage
const USERS_KEY = 'research_organizer_users';
const CURRENT_USER_KEY = 'current_user';
const THEME_KEY = 'theme'; // Add theme key

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
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }

  // Add dark mode toggle to auth pages
  setupDarkModeToggle() {
    const authHeader = document.querySelector('.auth-header');
    if (authHeader) {
      const darkModeToggle = document.createElement('button');
      darkModeToggle.className = 'auth-dark-toggle';
      darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      darkModeToggle.onclick = () => this.toggleDarkMode();
      
      // Position it in the top-right corner
      darkModeToggle.style.position = 'absolute';
      darkModeToggle.style.top = '1rem';
      darkModeToggle.style.right = '1rem';
      
      // Make the auth-card relative positioned
      document.querySelector('.auth-card').style.position = 'relative';
      document.querySelector('.auth-card').appendChild(darkModeToggle);
      
      // Update icon based on current theme
      this.updateDarkModeIcon();
    }
  }

  toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
    this.updateDarkModeIcon();
  }

  updateDarkModeIcon() {
    const toggle = document.querySelector('.auth-dark-toggle i');
    const isDark = document.body.classList.contains('dark-mode');
    
    if (toggle) {
      if (isDark) {
        toggle.classList.remove('fa-moon');
        toggle.classList.add('fa-sun');
      } else {
        toggle.classList.remove('fa-sun');
        toggle.classList.add('fa-moon');
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
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
      
      const passwordInput = document.getElementById('signupPassword');
      if (passwordInput) {
        passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
      }
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    if (!email || !password) {
      this.showError('Please fill in all fields');
      return;
    }

    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      this.showError('Invalid email or password');
      return;
    }

    this.setCurrentUser({
      id: user.id,
      name: user.name,
      email: user.email,
      rememberMe
    });

    this.showSuccess('Login successful!', () => {
      window.location.href = 'index.html';
    });
  }

  async handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;

    if (!name || !email || !password || !confirmPassword) {
      this.showError('Please fill in all fields');
      return;
    }

    if (!agreeTerms) {
      this.showError('Please accept the terms and conditions');
      return;
    }

    if (password !== confirmPassword) {
      this.showError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      this.showError('Password must be at least 6 characters long');
      return;
    }

    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.showError('User with this email already exists');
      return;
    }

    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveUsers();

    this.showSuccess('Account created successfully!', () => {
      window.location.href = 'login.html';
    });
  }

  checkPasswordStrength(password) {
    const strengthIndicator = document.getElementById('passwordStrength');
    if (!strengthIndicator) return;

    let strength = 0;
    let feedback = '';

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    switch (strength) {
      case 0:
      case 1:
        strengthIndicator.className = 'password-strength weak';
        feedback = 'Weak password';
        break;
      case 2:
      case 3:
        strengthIndicator.className = 'password-strength medium';
        feedback = 'Medium strength';
        break;
      case 4:
      case 5:
        strengthIndicator.className = 'password-strength strong';
        feedback = 'Strong password';
        break;
    }

    strengthIndicator.textContent = feedback;
  }

  showError(message) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      confirmButtonColor: '#dc2626',
      background: document.body.classList.contains('dark-mode') ? '#1f2937' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#1f2937'
    });
  }

  showSuccess(message, callback) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonColor: '#059669',
      timer: 2000,
      timerProgressBar: true,
      background: document.body.classList.contains('dark-mode') ? '#1f2937' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f3f4f6' : '#1f2937'
    }).then(() => {
      if (callback) callback();
    });
  }
}

// Password toggle functionality
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  const icon = input.parentElement.querySelector('.password-toggle i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
  new AuthSystem();
});


script.js
// Authentication check 
function checkAuthentication() {
  const currentUser = localStorage.getItem('current_user');
  if (!currentUser) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// Add user info display and logout functionality
function initUserInterface() {
  const currentUser = JSON.parse(localStorage.getItem('current_user'));
  if (currentUser) {
    updateHeaderWithUserInfo(currentUser);
  }
}

function updateHeaderWithUserInfo(user) {
  const headerButtons = document.querySelector('.header-buttons');
  
  const userMenu = document.createElement('div');
  userMenu.className = 'user-menu';
  userMenu.innerHTML = `
    <button class="user-btn" onclick="toggleUserDropdown()">
      <i class="fas fa-user"></i>
      ${user.name}
      <i class="fas fa-chevron-down"></i>
    </button>
    <div class="user-dropdown hidden" id="userDropdown">
      <div class="user-info">
        <strong>${user.name}</strong>
        <small>${user.email}</small>
      </div>
      <hr>
      <button onclick="logout()" class="logout-btn">
        <i class="fas fa-sign-out-alt"></i>
        Logout
      </button>
    </div>
  `;
  headerButtons.insertBefore(userMenu, headerButtons.firstChild);
}

function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  dropdown.classList.toggle('hidden');
}

function logout() {
  Swal.fire({
    title: 'Logout',
    text: 'Are you sure you want to logout?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Yes, logout',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('current_user');
      window.location.href = 'login.html';
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  
  if (!checkAuthentication()) {
    return;
  }
  
  initUserInterface();
  
  loadFromStorage();
  updateTopicsFilter();
  currentFilteredPapers = papers;
  renderPaginatedPapers();
  applyThemeFromStorage();
});
document.addEventListener('click', function(e) {
  const userMenu = document.querySelector('.user-menu');
  const dropdown = document.getElementById('userDropdown');
  
  if (userMenu && !userMenu.contains(e.target)) {
    if (dropdown) dropdown.classList.add('hidden');
  }
});



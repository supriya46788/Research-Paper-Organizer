// Authentication system using localStorage (for demo purposes)
const USERS_KEY = 'research_organizer_users';
const CURRENT_USER_KEY = 'current_user';

class AuthSystem {
  constructor() {
    this.users = this.loadUsers();
    this.initializeEventListeners();
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
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
      
      // Password strength checker
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

    // Find user
    const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user || user.password !== password) {
      this.showError('Invalid email or password');
      return;
    }

    // Set user session
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

    // Validation
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

    // Check if user already exists
    if (this.users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      this.showError('User with this email already exists');
      return;
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      password, // In production, this should be hashed!
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
      confirmButtonColor: '#dc2626'
    });
  }

  showSuccess(message, callback) {
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: message,
      confirmButtonColor: '#059669',
      timer: 2000,
      timerProgressBar: true
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




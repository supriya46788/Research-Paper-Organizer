class FormValidator {
  constructor() {
    this.form = document.getElementById('signupForm');
    this.passwordRequirements = {
      length: { regex: /.{8,}/, message: 'At least 8 characters' },
      uppercase: { regex: /[A-Z]/, message: 'One uppercase letter' },
      number: { regex: /[0-9]/, message: 'One number' },
      special: { regex: /[^A-Za-z0-9]/, message: 'One special character' }
    };
    this.initialize();
  }

  initialize() {
    if (!this.form) {
      console.error('Signup form not found!');
      return;
    }

    // Disable browser default validation
    this.form.setAttribute('novalidate', '');
    this.submitButton = this.form.querySelector('button[type="submit"]');
    
    // Initialize form elements
    this.initPasswordRequirements();
    this.addErrorContainers();
    this.addEventListeners();
    this.initPasswordToggle();
    
    // Set initial button state
    this.checkFormValidity();

    // Hide password requirements initially
    const passwordRequirements = document.getElementById('passwordRequirements');
    if (passwordRequirements) {
      passwordRequirements.style.display = 'none';
    }
  }

  initPasswordRequirements() {
    const requirementsList = document.querySelectorAll('.password-requirements [data-requirement]');
    requirementsList.forEach(item => {
      const requirement = item.getAttribute('data-requirement');
      item.textContent = this.passwordRequirements[requirement].message;
    });
  }

  initPasswordToggle() {
    document.querySelectorAll('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = toggle.getAttribute('data-target');
        const input = document.getElementById(targetId);
        const icon = toggle.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.replace('fa-eye', 'fa-eye-slash');
          toggle.setAttribute('aria-label', 'Hide password');
        } else {
          input.type = 'password';
          icon.classList.replace('fa-eye-slash', 'fa-eye');
          toggle.setAttribute('aria-label', 'Show password');
        }
      });
    });
  }

  addErrorContainers() {
    // Error containers are already in the HTML for better accessibility
    // This function is kept for backward compatibility
    return;
  }

  addEventListeners() {
    // Input fields validation
    const fields = ['signupName', 'signupEmail', 'signupPassword', 'confirmPassword'];
    
    fields.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (!input) return;

      // Initial validation on load
      this.validateField(fieldId, false);
      
      input.addEventListener('focus', () => {
        if (fieldId === 'signupPassword') {
          document.getElementById('passwordRequirements').style.display = 'block';
        }
      });

      // Validate on blur
      input.addEventListener('blur', () => {
        this.validateField(fieldId, true);
        this.checkFormValidity();
        if (fieldId === 'signupPassword') {
          document.getElementById('passwordRequirements').style.display = 'none';
        }
      });
      
      // Real-time validation with debounce
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.validateField(fieldId, true);
          
          // Special handling for password field
          if (fieldId === 'signupPassword') {
            this.updatePasswordStrength(input.value);
            this.updatePasswordRequirements(input.value);
            
            // Also validate confirm password when password changes
            const confirmPassword = document.getElementById('confirmPassword');
            if (confirmPassword && confirmPassword.value) {
              this.validateField('confirmPassword', true);
            }
          }
          
          this.checkFormValidity();
        }, 300);
      });
    });

    // Checkbox validation
    const agreeTerms = document.getElementById('agreeTerms');
    if (agreeTerms) {
      agreeTerms.addEventListener('change', () => {
        this.validateField('agreeTerms');
        this.checkFormValidity();
      });
    }

    // Form submission
    this.form.addEventListener('submit', (e) => this.validateForm(e));
  }

  updatePasswordStrength(password) {
    let strength = 0;
    const strengthBar = document.querySelector('.strength-bar');
    if (!strengthBar) return;

    // Check password strength
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    // Update strength bar
    const width = (strength / 4) * 100;
    strengthBar.style.width = `${width}%`;
    
    // Update strength bar color
    strengthBar.className = 'strength-bar ' + 
      (strength < 2 ? 'weak' : strength < 4 ? 'medium' : 'strong');
  }

  updatePasswordRequirements(password) {
    Object.keys(this.passwordRequirements).forEach(requirement => {
      const { regex } = this.passwordRequirements[requirement];
      const element = document.querySelector(`[data-requirement="${requirement}"]`);
      if (element) {
        element.classList.toggle('valid', regex.test(password));
      }
    });
  }

  validateField(fieldId, showError = true) {
    const input = document.getElementById(fieldId);
    if (!input) return false;
    
    // Find the error message container using aria-describedby
    const errorDesc = input.getAttribute('aria-describedby') || '';
    const errorId = errorDesc.split(' ').find(id => id.endsWith('Error'));
    const errorElement = errorId ? document.getElementById(errorId) : null;

    let isValid = true;
    let errorMessage = '';
    
    // Field-specific validation
    switch(fieldId) {
      case 'signupName':
        const nameValue = input.value.trim();
        if (nameValue === '') {
          errorMessage = 'Name is required';
          isValid = false;
        } else if (nameValue.length < 2) {
          errorMessage = 'Name must be at least 2 characters';
          isValid = false;
        } else if (!/^[\p{L}\s'-]+$/u.test(nameValue)) {
          errorMessage = 'Name contains invalid characters';
          isValid = false;
        }
        break;

      case 'signupEmail':
        const emailValue = input.value.trim();
        if (emailValue === '') {
          errorMessage = 'Email is required';
          isValid = false;
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(emailValue)) {
            errorMessage = 'Please enter a valid email address (e.g., user@example.com)';
            isValid = false;
          }
        }
        break;

      case 'signupPassword':
        if (!input.value) {
          errorMessage = 'Password is required';
          isValid = false;
        } else {
          const allRequirementsMet = Object.keys(this.passwordRequirements).every(key => {
            return this.passwordRequirements[key].regex.test(input.value);
          });
          
          if (!allRequirementsMet) {
            isValid = false;
          }
        }
        break;

      case 'confirmPassword':
        const password = document.getElementById('signupPassword').value;
        if (!input.value) {
          errorMessage = 'Please confirm your password';
          isValid = false;
        } else if (input.value !== password) {
          errorMessage = 'Passwords do not match';
          isValid = false;
        }
        break;

      case 'agreeTerms':
        if (!input.checked) {
          errorMessage = 'You must accept the terms and conditions to continue';
          isValid = false;
        }
        break;
    }

    // If we're not supposed to show an error, just return the validity.
    // This prevents checkFormValidity from clearing UI states of other fields.
    if (!showError) {
      return isValid;
    }

    // Reset visual states for the current field
    input.classList.remove('error', 'success');
    if (errorElement) {
      errorElement.classList.remove('show');
      errorElement.innerHTML = '';
    }

    // Update UI
    if (!isValid) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      if (errorElement && errorMessage) {
        errorElement.innerHTML = `
          <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
          <span>${errorMessage}</span>
        `;
        errorElement.classList.add('show');
      }
    } else {
      input.classList.add('success');
      input.setAttribute('aria-invalid', 'false');
    }

    return isValid;
  }

  // Helper function to format requirements list
  formatRequirements(requirements) {
    if (requirements.length === 1) return requirements[0];
    const last = requirements.pop();
    return `${requirements.join(', ')} and ${last}`;
  }

  checkFormValidity() {
    const fields = ['signupName', 'signupEmail', 'signupPassword', 'confirmPassword', 'agreeTerms'];
    const isFormValid = fields.every(fieldId => this.validateField(fieldId, false));

    if (this.submitButton) {
      this.submitButton.disabled = !isFormValid;
    }
  }

  validateForm(e) {
    // This listener runs before the one in auth.js.
    // If the form is invalid, we prevent the auth.js listener from running.
    const fields = ['signupName', 'signupEmail', 'signupPassword', 'confirmPassword', 'agreeTerms'];
    let isFormValid = true;
    let firstInvalidField = null;

    fields.forEach(fieldId => {
      const fieldIsValid = this.validateField(fieldId, true); // show errors
      if (!fieldIsValid) {
        isFormValid = false;
        if (!firstInvalidField) {
          firstInvalidField = document.getElementById(fieldId);
        }
      }
    });

    if (!isFormValid) {
      e.preventDefault();
      e.stopImmediatePropagation();

      if (firstInvalidField) {
        firstInvalidField.focus();
        firstInvalidField.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
    // If form is valid, do nothing, let auth.js handle it
  }
}

// Initialize form validation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new FormValidator();
});

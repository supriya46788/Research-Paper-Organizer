const v = (el) => el.value.trim();

// Validation rules
const rules = {
  name(value) {
    if (value.length < 2) return 'Please enter at least 2 characters.';
    return '';
  },
  email(value) {
    // Simple, user-friendly email pattern
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!ok) return 'Enter a valid email address.';
    return '';
  },
  message(value) {
    if (value.length < 10) return 'Message must be at least 10 characters.';
    return '';
  }
};

// Elements
const form = document.getElementById('contact-form');
const nameEl = document.getElementById('name');
const emailEl = document.getElementById('email');
const messageEl = document.getElementById('message');
const messageCounter = document.getElementById('message-counter');

const submitBtn = document.getElementById('submitBtn');
const submitText = submitBtn.querySelector('.submit-text');
const loadingSpinner = submitBtn.querySelector('.loading-spinner');

let isSubmitting = false;

// Show/clear error helpers
function setError(input, msg) {
  const group = input.closest('.form-group');
  const errorEl = group.querySelector('.field-error');

  if (msg) {
    group.classList.add('has-error');
    errorEl.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  } else {
    group.classList.remove('has-error');
    errorEl.textContent = '';
    input.removeAttribute('aria-invalid');
  }
}

function validateField(input) {
  const id = input.id;
  const value = v(input);
  const msg = rules[id] ? rules[id](value) : '';
  setError(input, msg);
  return !msg;
}

function validateAll() {
  const okName = validateField(nameEl);
  const okEmail = validateField(emailEl);
  const okMsg = validateField(messageEl);

  if (!(okName && okEmail && okMsg)) {
    // Subtle shake on the first invalid field
    const firstInvalid = [nameEl, emailEl, messageEl].find(el => el.closest('.form-group').classList.contains('has-error'));
    if (firstInvalid) {
      const group = firstInvalid.closest('.form-group');
      group.classList.add('shake');
      setTimeout(() => group.classList.remove('shake'), 400);
      firstInvalid.focus();
    }
  }

  return okName && okEmail && okMsg;
}

// Real-time validation
[nameEl, emailEl].forEach(el => {
  el.addEventListener('input', () => validateField(el));
  el.addEventListener('blur', () => validateField(el));
});

messageEl.addEventListener('input', () => {
  const len = messageEl.value.length;
  messageCounter.textContent = `${len} / ${messageEl.maxLength}`;
  validateField(messageEl);
});
messageCounter.textContent = `0 / ${messageEl.maxLength}`;

// Submit handling with robust double-submit prevention
form.addEventListener('submit', async function (event) {
  event.preventDefault();
  if (isSubmitting) return; // hard guard

  if (!validateAll()) return;

  // Lock UI
  isSubmitting = true;
  submitBtn.disabled = true;
  submitText.classList.add('hidden');
  loadingSpinner.classList.remove('hidden');

  await new Promise(r => setTimeout(r, 1200)); // Simulated API

  // Unlock UI
  isSubmitting = false;
  submitBtn.disabled = false;
  submitText.classList.remove('hidden');
  loadingSpinner.classList.add('hidden');

  // Success dialog
  Swal.fire({
    title: 'Success!',
    text: 'Your message has been sent successfully.',
    icon: 'success',
    confirmButtonText: 'OK',
    background: '#292929',
    color: '#ecf0f1',
    confirmButtonColor: '#3b82f6'
  }).then(() => {
    form.reset();
    messageCounter.textContent = `0 / ${messageEl.maxLength}`;
    // Clear any lingering errors
    [nameEl, emailEl, messageEl].forEach(el => setError(el, ''));
  });
});

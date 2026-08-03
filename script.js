/* ═══════════════════════════════════════════════════════════════
   Settings Form — Robust Validation & Accessible Interactivity
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM Elements ──────────────────────────────────────────────
  const form           = document.getElementById('settings-form');
  const btnSave        = document.getElementById('btn-save');
  const btnReset       = document.getElementById('btn-reset');
  const toastContainer = document.getElementById('toast-container');

  // Input Fields
  const fullnameInput  = document.getElementById('fullname');
  const emailInput     = document.getElementById('email');
  const usernameInput  = document.getElementById('username');
  const phoneInput     = document.getElementById('phone');
  const bioInput       = document.getElementById('bio');
  const bioCount       = document.getElementById('bio-count');
  const currentPwInput = document.getElementById('current-password');
  const newPwInput     = document.getElementById('new-password');
  const confirmPwInput = document.getElementById('confirm-password');

  // Strength Meter & Indicators
  const strengthMeter  = document.getElementById('strength-meter');
  const strengthBar    = document.getElementById('strength-bar');
  const strengthText   = document.getElementById('password-strength-status');

  // ─── Validation Rules & Edge Cases ────────────────────────────
  const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
  const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

  const validators = {
    fullname(val) {
      const trimmed = val.trim();
      if (!trimmed) return 'Full name is required';
      if (trimmed.length < 2) return 'Full name must be at least 2 characters';
      if (trimmed.length > 50) return 'Full name must be under 50 characters';
      return '';
    },

    email(val) {
      const trimmed = val.trim();
      if (!trimmed) return 'Email address is required';
      if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address (e.g. user@domain.com)';
      return '';
    },

    username(val) {
      const trimmed = val.trim();
      if (!trimmed) return 'Username is required';
      if (trimmed.length < 3) return 'Username must be at least 3 characters';
      if (trimmed.length > 20) return 'Username must be 20 characters or fewer';
      if (!USERNAME_REGEX.test(trimmed)) return 'Username can only contain letters, numbers, and underscores';
      return '';
    },

    phone(val) {
      const trimmed = val.trim();
      if (!trimmed) return ''; // Optional field
      if (!PHONE_REGEX.test(trimmed)) return 'Please enter a valid phone number (e.g. +1 555-0199)';
      return '';
    },

    'current-password'(val) {
      if (!val) return 'Current password is required';
      if (val.length < 8) return 'Password must be at least 8 characters';
      return '';
    },

    'new-password'(val) {
      if (!val) return 'New password is required';
      if (val.length < 8) return 'New password must be at least 8 characters';
      if (currentPwInput.value && val === currentPwInput.value) {
        return 'New password must be different from current password';
      }
      return '';
    },

    'confirm-password'(val) {
      if (!val) return 'Please confirm your new password';
      if (val !== newPwInput.value) return 'Passwords do not match';
      return '';
    }
  };

  // ─── Single Field Validation Execution ─────────────────────────
  function validateField(input) {
    const name = input.name || input.id;
    const group = input.closest('.form-group');
    const errorEl = document.getElementById(`${name}-error`);
    const validator = validators[name];

    if (!validator || !group) return true;

    const errorMessage = validator(input.value);

    if (errorMessage) {
      group.classList.remove('is-valid');
      group.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      if (errorEl) errorEl.textContent = errorMessage;
      return false;
    }

    group.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    if (errorEl) errorEl.textContent = '';

    // Mark valid if input has non-whitespace value
    if (input.value.trim().length > 0) {
      group.classList.add('is-valid');
    } else {
      group.classList.remove('is-valid');
    }

    return true;
  }

  // ─── Input Event Binding (Blur & Real-time) ───────────────────
  const fields = [
    fullnameInput,
    emailInput,
    usernameInput,
    phoneInput,
    currentPwInput,
    newPwInput,
    confirmPwInput
  ];

  fields.forEach(input => {
    let touched = false;

    input.addEventListener('blur', () => {
      touched = true;
      validateField(input);
    });

    input.addEventListener('input', () => {
      if (touched) {
        validateField(input);
      }
      // Dependent validation: re-check confirm password when new password changes
      if (input === newPwInput && confirmPwInput.closest('.form-group').classList.contains('is-invalid')) {
        validateField(confirmPwInput);
      }
    });

    input.addEventListener('paste', () => {
      setTimeout(() => validateField(input), 0);
    });
  });

  // ─── Character Count for Bio ──────────────────────────────────
  function updateBioCount() {
    bioCount.textContent = bioInput.value.length;
  }
  bioInput.addEventListener('input', updateBioCount);
  bioInput.addEventListener('paste', () => setTimeout(updateBioCount, 0));

  // ─── Password Strength Calculation ────────────────────────────
  function calculatePasswordStrength(password) {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0 to 4
  }

  const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const STRENGTH_COLORS = ['', 'var(--error)', 'var(--warning)', 'var(--blue)', 'var(--success)'];

  newPwInput.addEventListener('input', () => {
    const val = newPwInput.value;
    const score = calculatePasswordStrength(val);

    if (val) {
      strengthMeter.setAttribute('aria-valuenow', score);
      strengthBar.setAttribute('data-level', score);
      strengthText.textContent = `Strength: ${STRENGTH_LABELS[score]}`;
      strengthText.style.color = STRENGTH_COLORS[score];
    } else {
      strengthMeter.setAttribute('aria-valuenow', 0);
      strengthBar.removeAttribute('data-level');
      strengthText.textContent = '';
    }
  });

  // ─── Password Show/Hide Toggle ─────────────────────────────────
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (!targetInput) return;

      const isPassword = targetInput.type === 'password';
      targetInput.type = isPassword ? 'text' : 'password';

      button.classList.toggle('is-visible', isPassword);
      const fieldName = targetInput.previousElementSibling
        ? targetId.replace('-', ' ')
        : 'password';
      button.setAttribute('aria-label', isPassword ? `Hide ${fieldName}` : `Show ${fieldName}`);
    });
  });

  // ─── Form Submission Handling ─────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isFormValid = true;
    let firstInvalidInput = null;

    fields.forEach(input => {
      const valid = validateField(input);
      if (!valid) {
        isFormValid = false;
        if (!firstInvalidInput) {
          firstInvalidInput = input;
        }
      }
    });

    if (!isFormValid) {
      if (firstInvalidInput) {
        firstInvalidInput.focus();
        firstInvalidInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please correct the highlighted errors before saving.', 'error');
      return;
    }

    // Simulate submission state safely
    btnSave.classList.add('is-loading');
    btnSave.disabled = true;

    setTimeout(() => {
      btnSave.classList.remove('is-loading');
      btnSave.disabled = false;
      showToast('Settings saved successfully!', 'success');
    }, 1200);
  });

  // ─── Form Reset ───────────────────────────────────────────────
  btnReset.addEventListener('click', () => {
    form.reset();

    // Reset bio count & password strength
    updateBioCount();
    strengthMeter.setAttribute('aria-valuenow', 0);
    strengthBar.removeAttribute('data-level');
    strengthText.textContent = '';

    // Clear validation styling and error text
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('is-valid', 'is-invalid');
    });

    fields.forEach(input => {
      input.removeAttribute('aria-invalid');
    });

    document.querySelectorAll('.helper-text').forEach(span => {
      span.textContent = '';
    });

    // Reset password visibility buttons
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.classList.remove('is-visible');
      const targetId = button.dataset.target;
      const targetInput = document.getElementById(targetId);
      if (targetInput) {
        targetInput.type = 'password';
      }
      button.setAttribute('aria-label', `Show ${targetId.replace('-', ' ')}`);
    });

    showToast('Form has been reset to defaults.', 'success');
  });

  // ─── XSS-Safe Toast Notification Handler ────────────────────────
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const iconSpan = document.createElement('span');
    iconSpan.style.fontWeight = '700';
    iconSpan.style.fontSize = '1rem';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.textContent = type === 'success' ? '✓' : '✕';

    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;

    toast.appendChild(iconSpan);
    toast.appendChild(msgSpan);
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3500);
  }

})();

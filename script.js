/* ═══════════════════════════════════════════════════════════════
   Settings Form — Validation & Interactivity
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── DOM References ───────────────────────────────────────────
  const form           = document.getElementById('settings-form');
  const btnSave        = document.getElementById('btn-save');
  const btnReset       = document.getElementById('btn-reset');
  const toastContainer = document.getElementById('toast-container');

  // Fields
  const fullnameInput  = document.getElementById('fullname');
  const emailInput     = document.getElementById('email');
  const usernameInput  = document.getElementById('username');
  const phoneInput     = document.getElementById('phone');
  const bioInput       = document.getElementById('bio');
  const bioCount       = document.getElementById('bio-count');
  const currentPwInput = document.getElementById('current-password');
  const newPwInput     = document.getElementById('new-password');
  const confirmPwInput = document.getElementById('confirm-password');
  const strengthBar    = document.getElementById('strength-bar');
  const strengthText   = document.getElementById('strength-text');

  // ─── Validators ───────────────────────────────────────────────
  const validators = {
    fullname(value) {
      if (!value.trim()) return 'Full name is required';
      if (value.trim().length < 2) return 'Must be at least 2 characters';
      if (value.trim().length > 50) return 'Must be under 50 characters';
      return '';
    },

    email(value) {
      if (!value.trim()) return 'Email is required';
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) return 'Enter a valid email address';
      return '';
    },

    username(value) {
      if (!value.trim()) return 'Username is required';
      if (value.length < 3) return 'Must be at least 3 characters';
      if (value.length > 20) return 'Must be under 20 characters';
      if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores';
      return '';
    },

    phone(value) {
      if (!value.trim()) return ''; // optional
      if (!/^\+?[\d\s\-()]{7,15}$/.test(value)) return 'Enter a valid phone number';
      return '';
    },

    'current-password'(value) {
      if (!value) return 'Current password is required';
      if (value.length < 8) return 'Must be at least 8 characters';
      return '';
    },

    'new-password'(value) {
      if (!value) return 'New password is required';
      if (value.length < 8) return 'Must be at least 8 characters';
      return '';
    },

    'confirm-password'(value) {
      if (!value) return 'Please confirm your password';
      if (value !== newPwInput.value) return 'Passwords do not match';
      return '';
    }
  };

  // ─── Validate a single field ──────────────────────────────────
  function validateField(input) {
    const name    = input.name || input.id;
    const group   = input.closest('.form-group');
    const errorEl = document.getElementById(`${name}-error`);
    const validate = validators[name];

    if (!validate || !group) return true;

    const error = validate(input.value);

    group.classList.remove('is-valid', 'is-invalid');

    if (error) {
      group.classList.add('is-invalid');
      if (errorEl) errorEl.textContent = error;
      return false;
    }

    // Only mark valid if field is not empty (skip for optional empty fields)
    if (input.value.trim()) {
      group.classList.add('is-valid');
    }
    if (errorEl) errorEl.textContent = '';
    return true;
  }

  // ─── Real-time validation on blur + input ─────────────────────
  const fieldInputs = [fullnameInput, emailInput, usernameInput, phoneInput,
                       currentPwInput, newPwInput, confirmPwInput];

  fieldInputs.forEach(input => {
    let touched = false;

    input.addEventListener('blur', () => {
      touched = true;
      validateField(input);
    });

    input.addEventListener('input', () => {
      if (touched) validateField(input);
    });
  });

  // ─── Bio character counter ────────────────────────────────────
  bioInput.addEventListener('input', () => {
    bioCount.textContent = bioInput.value.length;
  });

  // ─── Password strength meter ─────────────────────────────────
  function getPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8)           score++;
    if (/[A-Z]/.test(password))         score++;
    if (/[0-9]/.test(password))         score++;
    if (/[^A-Za-z0-9]/.test(password))  score++;
    return score; // 0-4
  }

  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'var(--error)', 'var(--warning)', 'var(--blue)', 'var(--success)'];

  newPwInput.addEventListener('input', () => {
    const level = getPasswordStrength(newPwInput.value);
    strengthBar.setAttribute('data-level', newPwInput.value ? level : 0);

    if (newPwInput.value) {
      strengthText.textContent = strengthLabels[level] || '';
      strengthText.style.color = strengthColors[level] || '';
    } else {
      strengthText.textContent = '';
      strengthBar.removeAttribute('data-level');
    }
  });

  // ─── Password visibility toggles ─────────────────────────────
  document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      const isPassword = target.type === 'password';
      target.type = isPassword ? 'text' : 'password';
      btn.classList.toggle('is-visible', isPassword);
    });
  });

  // ─── Form submission ─────────────────────────────────────────
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    let allValid = true;
    fieldInputs.forEach(input => {
      if (!validateField(input)) allValid = false;
    });

    if (!allValid) {
      // Scroll to first error
      const firstError = form.querySelector('.is-invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      showToast('Please fix the errors above.', 'error');
      return;
    }

    // Simulate saving
    btnSave.classList.add('is-loading');
    btnSave.disabled = true;

    setTimeout(() => {
      btnSave.classList.remove('is-loading');
      btnSave.disabled = false;
      showToast('Settings saved successfully!', 'success');
    }, 1200);
  });

  // ─── Reset button ────────────────────────────────────────────
  btnReset.addEventListener('click', () => {
    form.reset();
    bioCount.textContent = '0';
    strengthBar.removeAttribute('data-level');
    strengthText.textContent = '';

    // Clear all validation states
    form.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('is-valid', 'is-invalid');
    });
    form.querySelectorAll('.helper-text').forEach(el => {
      el.textContent = '';
    });

    // Reset password toggles
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.classList.remove('is-visible');
      const target = document.getElementById(btn.dataset.target);
      target.type = 'password';
    });

    showToast('Form has been reset.', 'success');
  });

  // ─── Toast notification helper ────────────────────────────────
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    const icon = type === 'success' ? '✓' : '✕';
    toast.innerHTML = `<span style="font-weight:700;font-size:1rem;">${icon}</span> ${message}`;

    toastContainer.appendChild(toast);

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.add('is-leaving');
      toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
  }

})();

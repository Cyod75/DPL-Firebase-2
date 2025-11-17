// public/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');

      errorDiv.textContent = '';

      try {
        const resp = await fetch('/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          window.location.href = '/home.html';
        } else {
          errorDiv.textContent = data.error || 'Error en el registro';
        }
      } catch (err) {
        errorDiv.textContent = err.message || 'Error de red';
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const errorDiv = document.getElementById('error');

      errorDiv.textContent = '';

      try {
        const resp = await fetch('/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        if (resp.ok && data.success) {
          window.location.href = '/home.html';
        } else {
          errorDiv.textContent = data.error || 'Error en el login';
        }
      } catch (err) {
        errorDiv.textContent = err.message || 'Error de red';
      }
    });
  }
});

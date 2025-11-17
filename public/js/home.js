// public/js/home.js
document.addEventListener('DOMContentLoaded', async () => {
  const userDiv = document.getElementById('userInfo');
  const logoutBtn = document.getElementById('logoutBtn');

  try {
    const resp = await fetch('/api/user');
    if (resp.ok) {
      const data = await resp.json();
      const user = data.user;
      userDiv.innerHTML = `
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>UID:</strong> ${user.uid}</p>
      `;
    } else {
      // No autenticado → redirigir a login
      window.location.href = '/login.html';
    }
  } catch (err) {
    userDiv.textContent = 'Error al obtener información del usuario';
  }

  logoutBtn.addEventListener('click', () => {
    window.location.href = '/logout';
  });
});

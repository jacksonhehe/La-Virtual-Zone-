// Manejo simple de usuarios con localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem('vz_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('vz_users', JSON.stringify(users));
}

function calculateLevel(xp) {
  return Math.floor(xp / 100) + 1;
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const infoUser = document.getElementById('infoUser');
  const logoutBtn = document.getElementById('logoutBtn');
  const extraSections = document.getElementById('extraSections');

  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('regUser').value;
      const pass = document.getElementById('regPass').value;
      const role = document.getElementById('regRole').value;
      const users = getUsers();
      users.push({ user, pass, role, xp: 0 });
      saveUsers(users);
      alert('Registro exitoso');
      window.location.href = 'login.html';
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('loginUser').value;
      const pass = document.getElementById('loginPass').value;
      const users = getUsers();
      const found = users.find(u => u.user === user && u.pass === pass);
      if (found) {
        localStorage.setItem('vz_current', JSON.stringify(found));
        window.location.href = 'usuario.html';
      } else {
        alert('Datos incorrectos');
      }
    });
  }

  if (infoUser) {
    const current = JSON.parse(localStorage.getItem('vz_current'));
    if (!current) {
      window.location.href = 'login.html';
      return;
    }
    const level = calculateLevel(current.xp || 0);
    infoUser.innerHTML = `
      <h2>${current.user}</h2>
      <p>Rol: ${current.role}</p>
      <p>Nivel: ${level} - XP: ${current.xp || 0}</p>
      <p><a href="usuarios/example.html">Ver perfil público</a></p>
      <button id="gainXp">Ganar XP</button>`;

    const gainBtn = document.getElementById('gainXp');
    gainBtn.addEventListener('click', () => {
      const users = getUsers();
      const idx = users.findIndex(u => u.user === current.user);
      if (idx !== -1) {
        users[idx].xp = (users[idx].xp || 0) + 10;
        saveUsers(users);
        localStorage.setItem('vz_current', JSON.stringify(users[idx]));
        location.reload();
      }
    });

    if (extraSections) {
      if (current.role === 'dt') {
        extraSections.innerHTML += '<p><strong>Mi Club:</strong> acceso a gestion de club.</p>';
      }
      if (current.role === 'admin') {
        extraSections.innerHTML += '<p><strong>Panel de control:</strong> gestiona el sitio.</p>';
      }
    }
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('vz_current');
      window.location.href = 'index.html';
    });
  }
});

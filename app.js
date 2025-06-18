// Manejo simple de usuarios con localStorage
function getUsers() {
  return JSON.parse(localStorage.getItem('vz_users') || '[]');
}
function saveUsers(users) {
  localStorage.setItem('vz_users', JSON.stringify(users));
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const infoUser = document.getElementById('infoUser');
  const logoutBtn = document.getElementById('logoutBtn');

  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const user = document.getElementById('regUser').value;
      const pass = document.getElementById('regPass').value;
      const role = document.getElementById('regRole').value;
      const users = getUsers();
      users.push({ user, pass, role });
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
    infoUser.innerHTML = `<h2>${current.user}</h2><p>Rol: ${current.role}</p>`;
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      localStorage.removeItem('vz_current');
      window.location.href = 'index.html';
    });
  }
});

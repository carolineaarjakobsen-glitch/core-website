// ============================================================
//  Glimt – Auth state management
//  Inkluderes på alle sider etter firebase-config.js
//  Oppdaterer navbar automatisk basert på innloggingsstatus
// ============================================================

const auth = firebase.auth();

// ── Hjelpere ──────────────────────────────────────────────

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getAvatarColor(uid) {
  const colors = ['#d95f5f', '#5f7dd9', '#5fb87d', '#d9a45f', '#9b5fd9', '#5fbcd9'];
  let hash = 0;
  for (let c of uid) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return colors[Math.abs(hash) % colors.length];
}

// ── Navbar oppdatering ─────────────────────────────────────

function updateNavbar(user) {
  const loginBtn  = document.getElementById('nav-login-btn');
  const userArea  = document.getElementById('nav-user');
  const avatar    = document.getElementById('nav-avatar');
  const userName  = document.getElementById('nav-user-name');
  const userEmail = document.getElementById('nav-user-email');

  if (!loginBtn || !userArea) return;  // navbar ikke tilstede på siden

  if (user) {
    // Logget inn – vis avatar
    loginBtn.style.display  = 'none';
    userArea.style.display  = 'flex';

    const initials = getInitials(user.displayName || user.email);
    const color    = getAvatarColor(user.uid);

    if (user.photoURL) {
      avatar.innerHTML = `<img src="${user.photoURL}" alt="${initials}" />`;
    } else {
      avatar.textContent    = initials;
      avatar.style.background = color;
    }

    if (userName)  userName.textContent  = user.displayName || 'Bruker';
    if (userEmail) userEmail.textContent = user.email || '';
  } else {
    // Ikke logget inn – vis login-knapp
    loginBtn.style.display = '';
    userArea.style.display  = 'none';
  }
}

// ── Auth state listener (kjøres på alle sider) ─────────────

auth.onAuthStateChanged(user => {
  updateNavbar(user);
});

// ── Logg ut (kalles fra navbar-dropdown) ──────────────────

function signOutUser() {
  auth.signOut().then(() => {
    // Reload for å tilbakestille siden
    window.location.reload();
  });
}

// ── Toggle dropdown ────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const userArea   = document.getElementById('nav-user');
  const dropdown   = document.getElementById('nav-user-dropdown');
  if (!userArea || !dropdown) return;

  userArea.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
  });
});

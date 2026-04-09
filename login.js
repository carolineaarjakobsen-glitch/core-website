// ============================================================
//  CORE – Login-side logikk
//  Bruker Firebase Authentication (Google, Facebook, e-post)
// ============================================================

const auth = firebase.auth();

// ── Redirect hvis allerede logget inn ─────────────────────

auth.onAuthStateChanged(user => {
  if (user) {
    // Allerede logget inn – send tilbake til forrige side eller forsiden
    const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html';
    window.location.href = returnUrl;
  }
});

// ── Tab-bytte ──────────────────────────────────────────────

function switchTab(tab) {
  const tabLogin    = document.getElementById('tab-login');
  const tabReg      = document.getElementById('tab-register');
  const formLogin   = document.getElementById('form-login');
  const formReg     = document.getElementById('form-register');

  clearMessages();

  if (tab === 'login') {
    tabLogin.classList.add('active');
    tabReg.classList.remove('active');
    formLogin.style.display = '';
    formReg.style.display   = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabReg.classList.add('active');
    formLogin.style.display = 'none';
    formReg.style.display   = '';
  }
}

// ── Google Sign-In ──────────────────────────────────────────

function signInWithGoogle() {
  clearMessages();
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  auth.signInWithPopup(provider)
    .then(() => {
      // onAuthStateChanged tar hånd om redirect
    })
    .catch(err => showError(friendlyError(err)));
}

// ── Facebook Sign-In ────────────────────────────────────────

function signInWithFacebook() {
  clearMessages();
  const provider = new firebase.auth.FacebookAuthProvider();

  auth.signInWithPopup(provider)
    .then(() => {
      // onAuthStateChanged tar hånd om redirect
    })
    .catch(err => {
      if (err.code === 'auth/account-exists-with-different-credential') {
        showError('Det finnes allerede en konto med denne e-postadressen. Prøv å logge inn med Google eller e-post/passord.');
      } else {
        showError(friendlyError(err));
      }
    });
}

// ── E-post + passord: Logg inn ──────────────────────────────

function submitLogin(e) {
  e.preventDefault();
  clearMessages();

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-submit-btn');

  setLoading(btn, true);

  auth.signInWithEmailAndPassword(email, password)
    .catch(err => {
      showError(friendlyError(err));
      setLoading(btn, false);
    });
}

// ── E-post + passord: Registrer ─────────────────────────────

function submitRegister(e) {
  e.preventDefault();
  clearMessages();

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn      = document.getElementById('reg-submit-btn');

  setLoading(btn, true);

  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => {
      // Sett visningsnavn
      return cred.user.updateProfile({ displayName: name });
    })
    .catch(err => {
      showError(friendlyError(err));
      setLoading(btn, false);
    });
}

// ── Glemt passord ───────────────────────────────────────────

function forgotPassword(e) {
  e.preventDefault();
  clearMessages();

  const email = document.getElementById('login-email').value.trim();
  if (!email) {
    showError('Skriv inn e-postadressen din, så sender vi deg en lenke for å tilbakestille passordet.');
    return;
  }

  auth.sendPasswordResetEmail(email)
    .then(() => {
      showSuccess(`Vi har sendt en tilbakestillingslenke til ${email}. Sjekk innboksen din.`);
    })
    .catch(err => showError(friendlyError(err)));
}

// ── Vis/skjul passord ───────────────────────────────────────

function togglePassword(inputId, btn) {
  const input = document.getElementById(inputId);
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  btn.style.opacity = show ? '1' : '0.5';
}

// ── Hjelpere ────────────────────────────────────────────────

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.querySelector('.btn-text').style.display   = loading ? 'none' : '';
  btn.querySelector('.btn-spinner').style.display = loading ? '' : 'none';
}

function showError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = '';
}

function showSuccess(msg) {
  const el = document.getElementById('login-success');
  el.textContent = msg;
  el.style.display = '';
}

function clearMessages() {
  document.getElementById('login-error').style.display   = 'none';
  document.getElementById('login-success').style.display = 'none';
}

function friendlyError(err) {
  const messages = {
    'auth/user-not-found':            'Vi finner ingen konto med denne e-postadressen.',
    'auth/wrong-password':            'Feil passord. Prøv igjen eller bruk "Glemt passord".',
    'auth/email-already-in-use':      'Det finnes allerede en konto med denne e-postadressen.',
    'auth/weak-password':             'Passordet er for svakt. Bruk minst 6 tegn.',
    'auth/invalid-email':             'Ugyldig e-postadresse.',
    'auth/too-many-requests':         'For mange forsøk. Prøv igjen litt senere.',
    'auth/popup-closed-by-user':      'Innloggingsvinduet ble lukket. Prøv igjen.',
    'auth/network-request-failed':    'Nettverksfeil. Sjekk internettforbindelsen din.',
    'auth/popup-blocked':             'Nettleseren blokkerte innloggingsvinduet. Tillat popup-vinduer for denne siden og prøv igjen.',
    'auth/invalid-credential':        'Feil e-post eller passord.',
  };
  return messages[err.code] || `Noe gikk galt (${err.code}). Prøv igjen.`;
}

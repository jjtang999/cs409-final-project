const DEFAULT_API_URL = 'http://localhost:4000';

const getStorage = (keys) =>
  new Promise((resolve) => chrome.storage.sync.get(keys, (data) => resolve(data)));
const setStorage = (values) =>
  new Promise((resolve) => chrome.storage.sync.set(values, () => resolve(true)));
const removeStorage = (keys) =>
  new Promise((resolve) => chrome.storage.sync.remove(keys, () => resolve(true)));

const apiForm = document.getElementById('api-form');
const loginForm = document.getElementById('login-form');
const apiUrlInput = document.getElementById('apiUrl');
const apiStatus = document.getElementById('api-status');
const loginStatus = document.getElementById('login-status');
const logoutButton = document.getElementById('logout-button');
const connectedUser = document.getElementById('connected-user');
const connectedUsername = document.getElementById('connected-username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const renderUserState = (user) => {
  if (user) {
    connectedUsername.textContent = user.username || user.email;
    connectedUser.hidden = false;
    loginForm.hidden = true;
  } else {
    connectedUser.hidden = true;
    loginForm.hidden = false;
  }
};

const loadInitialState = async () => {
  const stored = await getStorage({ apiUrl: DEFAULT_API_URL, user: null });
  apiUrlInput.value = stored.apiUrl || DEFAULT_API_URL;
  renderUserState(stored.user);
};

apiForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const apiUrl = apiUrlInput.value.trim() || DEFAULT_API_URL;
  await setStorage({ apiUrl });
  apiStatus.textContent = 'Saved';
  apiStatus.classList.remove('error');
  apiStatus.classList.add('success');
  setTimeout(() => (apiStatus.textContent = ''), 2000);
});

loginForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  loginStatus.textContent = '';
  loginStatus.classList.remove('error', 'success');

  if (!email || !password) {
    loginStatus.textContent = 'Email and password are required.';
    loginStatus.classList.add('error');
    return;
  }

  const { apiUrl = DEFAULT_API_URL } = await getStorage({ apiUrl: DEFAULT_API_URL });
  loginStatus.textContent = 'Signing in...';

  try {
    const timezoneOffset = new Date().getTimezoneOffset();
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, timezoneOffset }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const message = errorBody.message || 'Unable to log in';
      throw new Error(message);
    }

    const payload = await response.json();
    await setStorage({ userId: payload.user.id, user: payload.user });
    loginStatus.textContent = 'Connected';
    loginStatus.classList.add('success');
    emailInput.value = '';
    passwordInput.value = '';
    renderUserState(payload.user);
  } catch (error) {
    loginStatus.textContent = error.message || 'Login failed';
    loginStatus.classList.add('error');
  }
});

logoutButton?.addEventListener('click', async () => {
  await removeStorage(['userId', 'user']);
  renderUserState(null);
  loginStatus.textContent = '';
});

loadInitialState();

// Focus Guard - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const loginView = document.getElementById('loginView');
  const mainView = document.getElementById('mainView');
  const loginForm = document.getElementById('loginForm');
  const loginError = document.getElementById('loginError');
  const logoutBtn = document.getElementById('logoutBtn');
  const userName = document.getElementById('userName');
  const statusText = document.getElementById('statusText');
  const statusDetail = document.getElementById('statusDetail');
  const statusDot = document.querySelector('.status-dot');
  const activeSessionCard = document.getElementById('activeSessionCard');
  const sessionName = document.getElementById('sessionName');
  const sessionTimer = document.getElementById('sessionTimer');
  const endSessionBtn = document.getElementById('endSessionBtn');
  const blockedCount = document.getElementById('blockedCount');
  const sessionStatus = document.getElementById('sessionStatus');

  let timerInterval = null;

  // Check if logged in
  const { authToken, user } = await chrome.storage.local.get(['authToken', 'user']);
  
  if (authToken && user) {
    showMainView(user);
    await refreshStatus();
  } else {
    showLoginView();
  }

  // Login form submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    loginForm.classList.add('loading');
    loginError.style.display = 'none';

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'LOGIN',
        email,
        password
      });

      if (response.success) {
        showMainView(response.user);
        await refreshStatus();
      } else {
        loginError.textContent = response.message || 'Login failed';
        loginError.style.display = 'block';
      }
    } catch (error) {
      loginError.textContent = 'Connection error';
      loginError.style.display = 'block';
    }

    loginForm.classList.remove('loading');
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ type: 'LOGOUT' });
    showLoginView();
  });

  // Quick focus buttons
  document.querySelectorAll('[data-duration]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const duration = parseInt(btn.dataset.duration);
      btn.disabled = true;
      btn.textContent = '...';

      try {
        const response = await chrome.runtime.sendMessage({
          type: 'START_QUICK_SESSION',
          duration
        });

        if (response.success) {
          await refreshStatus();
        } else {
          alert(response.message || 'Failed to start session');
        }
      } catch (error) {
        alert('Failed to start session');
      }

      btn.disabled = false;
      btn.textContent = `${duration} min`;
    });
  });

  // End session button
  endSessionBtn.addEventListener('click', async () => {
    const { authToken, blockingState } = await chrome.storage.local.get(['authToken', 'blockingState']);
    
    if (!blockingState?.activeFocusSession) return;
    
    try {
      // We'd need the session ID - for now just sync status
      await chrome.runtime.sendMessage({ type: 'SYNC_STATUS' });
      await refreshStatus();
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  });

  function showLoginView() {
    loginView.style.display = 'block';
    mainView.style.display = 'none';
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function showMainView(user) {
    loginView.style.display = 'none';
    mainView.style.display = 'block';
    userName.textContent = user?.username || user?.email || 'User';
  }

  async function refreshStatus() {
    try {
      await chrome.runtime.sendMessage({ type: 'SYNC_STATUS' });
      const { blockingState } = await chrome.storage.local.get('blockingState');
      
      if (blockingState) {
        updateStatusUI(blockingState);
      }
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  }

  function updateStatusUI(state) {
    // Update blocked count
    blockedCount.textContent = state.blockedUrls?.length || 0;
    
    // Update status indicator
    if (state.isEnabled) {
      statusDot.classList.add('active');
      statusDot.classList.remove('inactive');
      
      if (state.activeFocusSession) {
        statusText.textContent = 'Focus Mode Active';
        statusDetail.textContent = `Blocking ${state.blockedUrls?.length || 0} sites`;
        sessionStatus.textContent = 'Active';
        
        // Show session card
        activeSessionCard.style.display = 'block';
        sessionName.textContent = state.activeFocusSession.name;
        
        // Start timer
        startTimer(new Date(state.activeFocusSession.endAt));
      } else if (state.isInTimeBlock) {
        statusText.textContent = 'Scheduled Block Active';
        statusDetail.textContent = `Blocking ${state.blockedUrls?.length || 0} sites`;
        sessionStatus.textContent = 'Scheduled';
        activeSessionCard.style.display = 'none';
        stopTimer();
      }
    } else {
      statusDot.classList.remove('active');
      statusDot.classList.add('inactive');
      statusText.textContent = 'Not Blocking';
      statusDetail.textContent = 'Start a focus session to block distracting sites';
      sessionStatus.textContent = 'None';
      activeSessionCard.style.display = 'none';
      stopTimer();
    }
  }

  function startTimer(endAt) {
    stopTimer();
    
    function update() {
      const now = new Date();
      const diff = endAt - now;
      
      if (diff <= 0) {
        sessionTimer.textContent = '00:00';
        stopTimer();
        refreshStatus();
        return;
      }
      
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      sessionTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    update();
    timerInterval = setInterval(update, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  // Refresh status every 30 seconds
  setInterval(refreshStatus, 30000);
});

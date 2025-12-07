const params = new URLSearchParams(window.location.search);
const target = params.get('target');
const reason = params.get('reason');

const targetElement = document.getElementById('blocked-target');
const reasonElement = document.getElementById('blocked-reason');
const closeButton = document.getElementById('close-tab');
const optionsButton = document.getElementById('options-link');

if (targetElement) {
  try {
    const hostname = target ? new URL(target).hostname : 'This website';
    targetElement.textContent = `${hostname} is currently unavailable.`;
  } catch (error) {
    targetElement.textContent = 'This website is currently unavailable.';
  }
}

if (reasonElement) {
  reasonElement.textContent = reason || 'The site matches a scheduled block in FocusBlock Shield.';
}

if (closeButton) {
  closeButton.addEventListener('click', () => {
    window.close();
  });
}

if (optionsButton) {
  optionsButton.addEventListener('click', () => {
    if (chrome?.runtime?.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  });
}

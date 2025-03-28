// DOM Elements and Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Dark mode functionality
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check for saved theme preference or use system preference
  const currentTheme = localStorage.getItem('theme') || 
    (prefersDarkScheme.matches ? 'dark' : 'light');
  
  // Apply initial theme
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '🌙';
  }

  // Toggle theme
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Update button icon and save preference
    if (document.body.classList.contains('dark-mode')) {
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    } else {
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    }
  });

  // Journal functionality
  const journalForm = document.getElementById('journalEntry');
  const entriesGrid = document.getElementById('publicEntries');
  const imageUpload = document.getElementById('imageUpload');
  const privateToggle = document.getElementById('privateEntry');

  // Store entries in localStorage
  const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];

  // Handle form submission
  journalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = document.getElementById('entryContent').value;
    const location = document.getElementById('location').value;
    const isPrivate = privateToggle.checked;
    const files = imageUpload.files;

    // Convert images to base64
    const imagePromises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    const images = await Promise.all(imagePromises);

    // Create new entry
    const newEntry = {
      id: Date.now(),
      content,
      location,
      images,
      isPrivate,
      date: new Date().toISOString(),
    };

    // Add to entries array
    entries.unshift(newEntry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));

    // Reset form and refresh display
    journalForm.reset();
    displayEntries();
  });

  // Display entries
  function displayEntries() {
    if (!entriesGrid) return;

    const publicEntries = entries.filter(entry => !entry.isPrivate);
    entriesGrid.innerHTML = publicEntries.map(entry => `
      <article class="entry-card">
        ${entry.images.length > 0 ? `
          <img src="${entry.images[0]}" alt="Travel memory from ${entry.location}" class="entry-image">
        ` : ''}
        <div class="entry-content">
          <p class="entry-location">📍 ${entry.location}</p>
          <p>${entry.content}</p>
          <small>${new Date(entry.date).toLocaleDateString()}</small>
        </div>
      </article>
    `).join('');
  }

  // Initialize entries display
  displayEntries();
});

// Notification styles
const style = document.createElement('style');
style.textContent = `
  .notification {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: var(--accent-color);
    color: white;
    padding: 1rem 2rem;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    animation: slideIn 0.3s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
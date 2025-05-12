// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Redirect to home page on refresh
  if (performance.navigation.type === performance.navigation.TYPE_RELOAD) {
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
      return;
    }
    localStorage.clear();
    sessionStorage.clear();
  }

  // Theme Management
  const themeToggle = document.querySelector('.theme-toggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check for existing theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '🌙';
  } else {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '☀️';
  }

  // Toggle theme on button click
  themeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'dark');
    } else {
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'light');
    }
  });

 
  // 3. AUTHENTICATION
  const authModal = document.getElementById('authModal');
  const signInBtn = document.getElementById('signInBtn');
  const closeModal = document.getElementById('closeModal');
  const signInForm = document.getElementById('signInForm');
  const signUpForm = document.getElementById('signUpForm');
  const switchToSignUp = document.getElementById('switchToSignUp');
  const switchToSignIn = document.getElementById('switchToSignIn');

  // Show authentication modal
  signInBtn?.addEventListener('click', () => {
    authModal.classList.add('active');
    signInForm.classList.remove('hidden');
    signUpForm.classList.add('hidden');
  });

  // Close auth modal
  closeModal?.addEventListener('click', () => {
    authModal.classList.remove('active');
  });

  // Close modal when clicking outside
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.classList.remove('active');
    }
  });

  // Switch between sign in and sign up forms
  switchToSignUp?.addEventListener('click', (e) => {
    e.preventDefault();
    signInForm.classList.add('hidden');
    signUpForm.classList.remove('hidden');
  });

  switchToSignIn?.addEventListener('click', (e) => {
    e.preventDefault();
    signUpForm.classList.add('hidden');
    signInForm.classList.remove('hidden');
  });

   // Handle sign up
  signUpForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signUpName').value;
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    try {
      const user = {
        email,
        name,
        token: 'demo-token'
      };

      localStorage.setItem('user', JSON.stringify(user));
      updateAuthUI(user);
      authModal.classList.remove('active');
      showNotification('Account created successfully!');
    } catch (error) {
      showNotification('Error creating account', 'error');
    }
  });
  
  // Handle sign in
  signInForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signInEmail').value;
    const password = document.getElementById('signInPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    try {
      const user = {
        email,
        name: 'Welcome back!',
        token: 'demo-token'
      };

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        sessionStorage.setItem('user', JSON.stringify(user));
      }

      updateAuthUI(user);
      authModal.classList.remove('active');
      showNotification('Successfully signed in!');
    } catch (error) {
      showNotification('Invalid email or password', 'error');
    }
  });

 

  // Update UI based on auth state
  function updateAuthUI(user) {
    if (user) {
      signInBtn.textContent = user.name;
      signInBtn.classList.add('authenticated');
    } else {
      signInBtn.textContent = 'Sign In';
      signInBtn.classList.remove('authenticated');
    }
  }

  // Check for existing user
  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (storedUser) {
    updateAuthUI(JSON.parse(storedUser));
  }

  // Journal Entry Elements
  const journalForm = document.getElementById('journalEntry');
  const imageUpload = document.getElementById('imageUpload');
  const privateToggle = document.getElementById('privateEntry');
  const imagePreview = document.createElement('div');
  imagePreview.className = 'image-preview';
  imageUpload.parentNode.insertBefore(imagePreview, imageUpload.nextSibling);

  // Image preview functionality
  imageUpload.addEventListener('change', (e) => {
    imagePreview.innerHTML = '';
    
    Array.from(e.target.files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        const preview = document.createElement('div');
        preview.className = 'preview-item';
        
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          preview.appendChild(img);
        };
        
        reader.readAsDataURL(file);
        imagePreview.appendChild(preview);
      }
    });
  });

  // Store entries
  const entries = JSON.parse(localStorage.getItem('journalEntries')) || [];

  // Handle form submission
  journalForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = document.getElementById('entryContent').value;
    const location = document.getElementById('location').value;
    const isPrivate = privateToggle.checked;
    const files = imageUpload.files;

    const imagePromises = Array.from(files).map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    const images = await Promise.all(imagePromises);

    const newEntry = {
      id: Date.now(),
      content,
      location,
      images,
      isPrivate,
      date: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    localStorage.setItem('journalEntries', JSON.stringify(entries));

// redirect to private journal page if the entry is private
    if(isPrivate && !window.location.pathname.includes('private-journal.html')) {
      window.location.href = 'private-journal.html';
      return;
    }

    // Display entries based on current page
    if (window.location.pathname.includes('private-journal.html')) {
      const privateEntries = entries.filter(entry => entry.isPrivate);
      displayEntries(privateEntries, 'privateEntries');
    } else {
      const publicEntries = entries.filter(entry => !entry.isPrivate);
      displayEntries(publicEntries, 'publicEntries');
    }

    journalForm.reset();
    imagePreview.innerHTML = '';
  });

  // Display entries
  function displayEntries(filteredEntries, containerId) {
    const entriesGrid = document.getElementById(containerId);
    if (!entriesGrid) return;

    entriesGrid.innerHTML = filteredEntries.map(entry => `
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
  if (window.location.pathname.includes('private-journal.html')) {
    const privateEntries = entries.filter(entry => entry.isPrivate);
    displayEntries(privateEntries, 'privateEntries');
  } else {
    const publicEntries = entries.filter(entry => !entry.isPrivate);
    displayEntries(publicEntries, 'publicEntries');
  }

  // Notification function
  function showNotification(message, type = 'success') {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        container.removeChild(notification);
      }, 300);
    }, 3000);
  }
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
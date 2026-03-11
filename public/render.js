// Simple renderer to populate page using config files
function renderPage() {
  try {
    // textos
    if (window.TEXTOS) {
      document.getElementById('title').innerText = TEXTOS.title || '';
      document.getElementById('help-text').innerText = TEXTOS.helpText || '';
      document.getElementById('who-we-are').innerText = TEXTOS.who || '';
      document.getElementById('donate-modal-title').innerText = TEXTOS.donateTitle || 'Donate';
      document.getElementById('donate-modal-sub-title').innerText = TEXTOS.donateSubtitle || '';
      
      // About section
      const aboutContent = document.getElementById('about-content');
      if (aboutContent && TEXTOS.aboutSection) {
        aboutContent.innerHTML = TEXTOS.aboutSection;
      }
    }

    // Note: Images are loaded directly in HTML for instant display
    // No JavaScript needed for images

    // perguntas (FAQ)
    if (window.PERGUNTAS && Array.isArray(PERGUNTAS)) {
      const faq = document.getElementById('faq');
      PERGUNTAS.forEach(q => {
        const item = document.createElement('div');
        item.className = 'faq-item';
        item.innerHTML = `<div class="faq-question"><h3>${q.q}</h3><span class="faq-icon">▾</span></div><div class="faq-answer"><p>${q.a}</p></div>`;
        faq.appendChild(item);
      });
    }

    // comentarios
    if (window.COMENTARIOS && Array.isArray(COMMENTARIOS)) {
      const area = document.getElementById('comments-area');
      const isMobile = window.innerWidth <= 768;
      const initialShow = 2; // Show 2 comments on mobile initially

      function avatarGradient(color) {
        return `background: linear-gradient(135deg, ${color} 0%, ${color}dd 100%);`;
      }

      // Render comments with show more/less for mobile
      COMENTARIOS.forEach((c, index) => {
        const div = document.createElement('div');
        div.className = 'comentario';
        if (isMobile && index >= initialShow) {
          div.classList.add('hidden-comment');
        }
        
        let repliesHTML = '';
        if (c.replies && c.replies.length > 0) {
          repliesHTML = '<div class="replies">';
          c.replies.forEach(r => {
            repliesHTML += `
              <div class="reply">
                <div class="reply-header">
                  <div class="avatar" style="${avatarGradient(r.avatarColor || '#ccc')}">${r.avatar || 'A'}</div>
                  <strong>${r.author}</strong>
                </div>
                <p>${r.text}</p>
              </div>
            `;
          });
          repliesHTML += '</div>';
        }
        
        div.innerHTML = `
          <div class="comment-header">
            <div class="avatar" style="${avatarGradient(c.avatarColor || '#ccc')}">${c.avatar || 'A'}</div>
            <strong>${c.author}</strong>
          </div>
          <p class="comment-text">${c.text}</p>
          <div class="comment-stats">
            <span class="likes" data-index="${index}">♡ ${c.likes || 0}</span>
            <span class="views" data-index="${index}">👁️ ${c.views || 0}</span>
          </div>
          ${repliesHTML}
        `;
        area.appendChild(div);
      });

      // Add Show More/Less button for mobile
      if (isMobile && COMENTARIOS.length > initialShow) {
        const showMoreBtn = document.createElement('button');
        showMoreBtn.className = 'show-more-btn';
        showMoreBtn.textContent = 'Show More (' + (COMENTARIOS.length - initialShow) + ')';
        showMoreBtn.addEventListener('click', function() {
          const hiddenComments = area.querySelectorAll('.hidden-comment');
          const isShowing = hiddenComments[0].style.display !== 'none';
          hiddenComments.forEach(c => {
            c.style.display = isShowing ? 'none' : 'block';
          });
          this.textContent = isShowing ? 'Show More (' + (COMENTARIOS.length - initialShow) + ')' : 'Show Less';
        });
        area.appendChild(showMoreBtn);
      }

      // Add click listeners to likes and views
      document.querySelectorAll('.likes').forEach(likeBtn => {
        likeBtn.addEventListener('click', function() {
          const idx = this.getAttribute('data-index');
          COMENTARIOS[idx].likes = (COMENTARIOS[idx].likes || 0) + 1;
          this.innerText = `♡ ${COMENTARIOS[idx].likes}`;
        });
      });

      document.querySelectorAll('.views').forEach(viewBtn => {
        viewBtn.addEventListener('click', function() {
          const idx = this.getAttribute('data-index');
          COMENTARIOS[idx].views = (COMENTARIOS[idx].views || 0) + 1;
          this.innerText = `👁️ ${COMENTARIOS[idx].views}`;
        });
      });
    }

    // set CSS vars from CORES
    if (window.CORES) {
      for (const k in CORES) {
        document.documentElement.style.setProperty(`--${k}`, CORES[k]);
      }
    }

  } catch (err) { console.error('renderPage error', err); }
}

// Notification System
// Track if a notification is currently showing
let isNotificationShowing = false;

function showNotification(type, data, onCloseCallback) {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  const notif = document.createElement('div');
  notif.className = `notification ${type}`;

  let typeLabel = '';
  let title = '';
  let message = '';

  if (type === 'donation') {
    typeLabel = '💰 Donation';
    title = `${data.name} just donated ${data.amount}`;
    message = '🎉 Thank you for supporting Imani Children!';
  } else if (type === 'comment') {
    typeLabel = '💬 Comment';
    title = `${data.name} commented`;
    message = `"${data.text}"`;
  } else if (type === 'like') {
    typeLabel = '❤️ Like';
    title = `${data.name} liked this campaign`;
    message = '👍 Spreading the word!';
  }

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  notif.innerHTML = `
    <div class="notification-avatar" style="background-color: ${data.color}">
      ${data.initials}
    </div>
    <div class="notification-content">
      <div class="notification-type-label">${typeLabel}</div>
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
      <div class="notification-time">${timeStr}</div>
    </div>
    <button class="notification-close" aria-label="Close">×</button>
    <div class="notification-progress"></div>
  `;

  container.appendChild(notif);

  // Function to handle notification removal
  function handleNotificationClose() {
    notif.classList.add('remove');
    setTimeout(() => {
      notif.remove();
      isNotificationShowing = false;
      if (onCloseCallback) onCloseCallback();
    }, 400);
  }

  // Close button functionality
  const closeBtn = notif.querySelector('.notification-close');
  closeBtn.addEventListener('click', handleNotificationClose);

  // Auto remove after 6 seconds
  setTimeout(() => {
    if (notif.parentNode) {
      handleNotificationClose();
    }
  }, 6000);
}

// Start showing random notifications
function startNotificationSystem() {
  if (!window.NOTIFICACOES) return;

  // Support both object format {donors, commenters, likers} and legacy array format
  const notifData = window.NOTIFICACOES;
  const allDonors    = Array.isArray(notifData) ? [] : (notifData.donors    || []);
  const allCommenters = Array.isArray(notifData) ? [] : (notifData.commenters || []);
  const allLikers    = Array.isArray(notifData) ? [] : (notifData.likers    || []);

  // Build weighted pool so all three types appear
  const pool = [];
  allDonors.forEach(d    => pool.push({ type: 'donation', data: d }));
  allCommenters.forEach(c => pool.push({ type: 'comment',  data: c }));
  allLikers.forEach(l    => pool.push({ type: 'like',      data: l }));

  if (pool.length === 0) return;

  let lastIndex = -1;

  function showRandomNotification() {
    // Don't show new notification if one is already showing
    if (isNotificationShowing) return;
    
    let idx;
    do { idx = Math.floor(Math.random() * pool.length); } while (idx === lastIndex && pool.length > 1);
    lastIndex = idx;
    const item = pool[idx];
    
    isNotificationShowing = true;
    showNotification(item.type, item.data);
  }

  // Show first notification after 3 seconds, then every 30 seconds
  // Only show next notification after current one is closed
  const NOTIFICATION_INTERVAL = 30000; // 30 seconds

  setTimeout(function showNextNotification() {
    showRandomNotification();
    
    // Schedule next notification 30 seconds after current one closes
    setTimeout(showNextNotification, NOTIFICATION_INTERVAL);
  }, 3000);
}

// Start notification system when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startNotificationSystem);
} else {
  startNotificationSystem();
}

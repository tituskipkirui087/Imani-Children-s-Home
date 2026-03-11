// Payment Details - Bank Transfer / M-Pesa
// Copy address function
function copyAddress() {
  const addrEl = document.getElementById('wallet-address');
  if (addrEl) {
    const address = addrEl.textContent;
    
    // Try clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(address).then(function() {
        showCopyMessage();
      }).catch(function() {
        fallbackCopy(address);
      });
    } else {
      fallbackCopy(address);
    }
  }
}

// Fallback copy function
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
    showCopyMessage();
  } catch (err) {
    alert('Copy failed. Please copy manually: ' + text);
  }
  document.body.removeChild(textArea);
}

function showCopyMessage() {
  const msgEl = document.getElementById('copy-msg');
  if (msgEl) {
    msgEl.style.display = 'block';
    setTimeout(function() {
      msgEl.style.display = 'none';
    }, 2000);
  }
}

// Show payment details (Bank Transfer / M-Pesa)
function showPaymentDetails(amount) {
  const modal = document.getElementById('modal-doacao');
  if (!modal) return;
  const container = modal.querySelector('.select-amount');
  if (!container) return;
  
  const paymentHTML = '<div class="payment-details-widget" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:24px;text-align:center;color:#fff;max-width:380px;margin:0 auto;font-family:Arial,sans-serif;">' +
    '<h3 style="margin:0 0 20px;font-size:24px;color:#25d366;">Make Payment</h3>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">You are donating:</p>' +
      '<p style="margin:0;font-size:36px;font-weight:bold;color:#fff;">KSh ' + amount.toLocaleString() + '</p>' +
    '</div>' +
    
    // M-Pesa Section
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">' +
      '<h4 style="margin:0 0 12px;color:#25d366;font-size:16px;">📱 M-Pesa</h4>' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Paybill Number:</p>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">' +
        '<p style="margin:0;font-size:18px;word-break:break-all;color:#fff;background:#16213e;padding:10px;border-radius:8px;flex:1;font-weight:bold;" id="wallet-address">123456</p>' +
        '<button onclick="copyAddress()" style="background:#25d366;color:#fff;border:none;padding:10px 12px;border-radius:8px;font-size:16px;cursor:pointer;" title="Copy">📋</button>' +
      '</div>' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Account Number:</p>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<p style="margin:0;font-size:18px;word-break:break-all;color:#fff;background:#16213e;padding:10px;border-radius:8px;flex:1;font-weight:bold;">1234567890</p>' +
        '<button onclick="copyAccount()" style="background:#25d366;color:#fff;border:none;padding:10px 12px;border-radius:8px;font-size:16px;cursor:pointer;" title="Copy">📋</button>' +
      '</div>' +
      '<p id="copy-msg" style="margin:8px 0 0;color:#4caf50;font-size:12px;display:none;">✓ Copied!</p>' +
    '</div>' +
    
    // Bank Transfer Section
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;text-align:left;">' +
      '<h4 style="margin:0 0 12px;color:#2563eb;font-size:16px;">🏦 Bank Transfer</h4>' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Bank Name:</p>' +
      '<p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:bold;">Kenya Commercial Bank (KCB)</p>' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Account Name:</p>' +
      '<p style="margin:0 0 12px;color:#fff;font-size:14px;font-weight:bold;">Imani Children\'s Home</p>' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Account Number:</p>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<p style="margin:0;font-size:16px;word-break:break-all;color:#fff;background:#16213e;padding:10px;border-radius:8px;flex:1;font-weight:bold;">1234567890</p>' +
        '<button onclick="copyBankAccount()" style="background:#2563eb;color:#fff;border:none;padding:10px 12px;border-radius:8px;font-size:16px;cursor:pointer;" title="Copy">📋</button>' +
      '</div>' +
      '<p id="bank-copy-msg" style="margin:8px 0 0;color:#4caf50;font-size:12px;display:none;">✓ Copied!</p>' +
    '</div>' +
    
    '<p style="margin:0;color:#ffc107;font-size:14px;">⏳ After payment, click below to confirm</p>' +
    '<button onclick="confirmDonation()" style="margin-top:12px;background:#25d366;color:#fff;border:none;padding:14px 24px;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;width:100%;">I Have Paid ✓</button>' +
    '<button onclick="closePaymentDetails()" style="margin-top:8px;background:transparent;color:#aaa;border:1px solid #555;padding:10px;border-radius:8px;cursor:pointer;width:100%;">← Change Amount</button>' +
  '</div>';
  
  container.innerHTML = paymentHTML;
  container.classList.remove('hidden');
}

// Copy M-Pesa account number
function copyAccount() {
  const text = '1234567890';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      showCopyMessage();
    }).catch(function() {
      fallbackCopy(text);
    });
  } else {
    fallbackCopy(text);
  }
}

// Copy bank account number
function copyBankAccount() {
  const text = '1234567890';
  const msgEl = document.getElementById('bank-copy-msg');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function() {
      if (msgEl) {
        msgEl.style.display = 'block';
        setTimeout(function() {
          msgEl.style.display = 'none';
        }, 2000);
      }
    }).catch(function() {
      alert('Copy failed. Please copy manually: ' + text);
    });
  } else {
    alert('Copy failed. Please copy manually: ' + text);
  }
}

// Confirm donation
function confirmDonation() {
  const modal = document.getElementById('modal-doacao');
  if (modal) {
    const sel = modal.querySelector('.select-amount');
    const thx = modal.querySelector('.thanks');
    if (sel) sel.classList.add('hidden');
    if (thx) thx.classList.remove('hidden');
  }
}

// Close and reload
function closePaymentDetails() {
  location.reload();
}

// Comments Show More/Less for mobile
function initCommentsShowMore() {
  const area = document.getElementById('comments-area');
  if (!area) return;
  
  // Wait a bit for render.js to complete
  setTimeout(function() {
    const comments = area.querySelectorAll('.comentario');
    const isMobile = window.innerWidth <= 768;
    const initialShow = 2;
    
    // Remove any existing buttons first
    const existingBtn = area.querySelector('.show-more-btn');
    if (existingBtn) existingBtn.remove();
    
    if (isMobile && comments.length > initialShow) {
      // Hide comments beyond initialShow
      for (let i = initialShow; i < comments.length; i++) {
        comments[i].style.display = 'none';
        comments[i].dataset.hidden = 'true';
      }
      
      // Create show more button
      const btn = document.createElement('button');
      btn.className = 'show-more-btn visible';
      btn.setAttribute('type', 'button');
      btn.innerHTML = 'Show More <span style="font-size:12px;">▾</span>';
      
      // Make sure button is visible with explicit styles
      btn.style.display = 'block';
      btn.style.visibility = 'visible';
      btn.style.width = '100%';
      btn.style.padding = '12px';
      btn.style.margin = '10px 0';
      btn.style.background = '#f0f0f0';
      btn.style.border = 'none';
      btn.style.borderRadius = '8px';
      btn.style.color = '#2563eb';
      btn.style.fontWeight = '600';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '14px';
      btn.style.textAlign = 'center';
      
      let showingAll = false;
      
      btn.addEventListener('click', function() {
        const hidden = area.querySelectorAll('[data-hidden="true"]');
        
        hidden.forEach(function(c) {
          c.style.display = showingAll ? 'none' : 'block';
        });
        
        showingAll = !showingAll;
        btn.innerHTML = showingAll ? 'Show Less <span style="font-size:12px;">▴</span>' : 'Show More <span style="font-size:12px;">▾</span>';
      });
      
      area.appendChild(btn);
    }
  }, 100);
}

// Mobile Carousel with image preloading for slow connections
function initMobileCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  
  const slides = track.querySelectorAll('.carousel-slide');
  if (slides.length === 0) return;
  
  let currentIndex = 0;
  let isTransitioning = false;
  let loadedImages = {};
  
  // Preload all images first
  function preloadImages() {
    slides.forEach(function(slide, index) {
      const img = slide.querySelector('img');
      if (img && img.src) {
        const imageLoader = new Image();
        imageLoader.onload = function() {
          loadedImages[index] = true;
          // Show first image immediately when loaded
          if (index === 0 && !slides[0].classList.contains('active')) {
            slides[0].classList.add('active');
          }
        };
        imageLoader.onerror = function() {
          loadedImages[index] = false;
        };
        imageLoader.src = img.src;
      } else {
        loadedImages[index] = true;
      }
    });
  }
  
  // Start preloading
  preloadImages();
  
  // Show first slide after a short delay or immediately if already loaded
  setTimeout(function() {
    if (loadedImages[0] || slides[0].querySelector('img').complete) {
      slides[0].classList.add('active');
    } else {
      slides[0].querySelector('img').onload = function() {
        slides[0].classList.add('active');
      };
    }
  }, 500);
  
  // Change slide with better transition handling
  function changeSlide() {
    if (isTransitioning) return;
    
    const nextIndex = (currentIndex + 1) % slides.length;
    
    // Check if next image is loaded
    if (!loadedImages[nextIndex] && !slides[nextIndex].querySelector('img').complete) {
      // Skip to next if not loaded, try again in 1 second
      setTimeout(changeSlide, 1000);
      return;
    }
    
    isTransitioning = true;
    
    // Remove active from current
    slides[currentIndex].classList.remove('active');
    
    // Add active to next
    currentIndex = nextIndex;
    slides[currentIndex].classList.add('active');
    
    // Reset transition lock after animation completes
    setTimeout(function() {
      isTransitioning = false;
    }, 800); // Match CSS transition duration
  }
  
  // Change slide every 5 seconds (slower for better user experience on slow connections)
  setInterval(changeSlide, 5000);
}

// Make functions global
window.showPaymentDetails = showPaymentDetails;
window.confirmDonation = confirmDonation;
window.closePaymentDetails = closePaymentDetails;
window.copyAddress = copyAddress;
window.copyAccount = copyAccount;
window.copyBankAccount = copyBankAccount;

// DOM ready
document.addEventListener('DOMContentLoaded', function() {
  // Hamburger menu
  var hamburger = document.querySelector('.hamburger');
  var mainNav = document.querySelector('.main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('active');
      mainNav.classList.toggle('active');
    });
    document.addEventListener('click', function(e) {
      if (!hamburger.contains(e.target) && !mainNav.contains(e.target)) {
        hamburger.classList.remove('active');
        mainNav.classList.remove('active');
      }
    });
  }
  
  // Render page
  if (typeof renderPage === 'function') {
    try { renderPage(); } catch (e) {}
  }
  
  // Mobile carousel
  initMobileCarousel();
  
  // Comments show more/less - delay to ensure render.js has finished
  setTimeout(initCommentsShowMore, 500);
  
  // Handle window resize to re-init comments show more
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initCommentsShowMore, 250);
  });
  
  // Amount buttons - show payment details
  var amountBtns = document.querySelectorAll('.valor-btn[data-amount]');
  amountBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var amount = parseFloat(btn.getAttribute('data-amount'));
      if (amount && amount > 0) {
        localStorage.setItem('amount-selected', amount);
        var customInput = document.getElementById('custom-amount-input');
        if (customInput) customInput.value = amount;
        showPaymentDetails(amount);
      }
    });
  });
  
  // Custom amount Enter key
  var customInput = document.getElementById('custom-amount-input');
  if (customInput) {
    customInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        var amount = parseFloat(customInput.value);
        if (amount && amount > 0) {
          localStorage.setItem('amount-selected', amount);
          // Also update the champion button text to show entered amount
          var championBtn = document.querySelector('#highest-price .valor-btn');
          if (championBtn) {
            championBtn.innerHTML = '💛 KSh ' + amount.toLocaleString() + ' — Be a Champion for Imani Children';
            championBtn.setAttribute('data-amount', amount);
          }
          showPaymentDetails(amount);
        }
      }
    });
    
    // Update champion button as user types
    customInput.addEventListener('input', function(e) {
      var amount = parseFloat(e.target.value);
      var championBtn = document.querySelector('#highest-price .valor-btn');
      if (championBtn && amount && amount > 0) {
        championBtn.innerHTML = '💛 KSh ' + amount.toLocaleString() + ' — Be a Champion for Imani Children';
        championBtn.setAttribute('data-amount', amount);
      }
    });
  }
});

// NOWPayment Crypto Widget
const NOWPAYMENT_API_KEY = "6XQDG6M-WK54TG4-GWA8712-VA25NZW";
let availableCryptos = ['BTC', 'ETH', 'USDT', 'LTC', 'XRP', 'DOGE', 'ADA', 'MATIC'];

// Get crypto symbol and color
function getCryptoInfo(crypto) {
  const symbols = {
    'BTC': { s: '₿', c: '#F7931A' },
    'ETH': { s: 'Ξ', c: '#627EEA' },
    'USDT': { s: '₮', c: '#26A17B' },
    'LTC': { s: 'Ł', c: '#BFBBBB' },
    'XRP': { s: '✕', c: '#23292F' },
    'DOGE': { s: 'Ð', c: '#C2A633' },
    'ADA': { s: '₳', c: '#0033AD' },
    'MATIC': { s: 'M', c: '#8247E5' }
  };
  return symbols[crypto.toUpperCase()] || { s: '$', c: '#f0b90b' };
}

// Store payment data globally
let currentPaymentData = {};

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

// Create crypto payment widget - Step 1: Select crypto
function createCryptoWidget(usdAmount, selectedCrypto) {
  const cryptoName = (selectedCrypto || 'BTC').toUpperCase();
  const info = getCryptoInfo(cryptoName);
  
  // Build dropdown options
  let options = '';
  availableCryptos.forEach(function(c) {
    const sel = c.toUpperCase() === cryptoName ? 'selected' : '';
    options += '<option value="' + c.toLowerCase() + '" ' + sel + '>' + c + '</option>';
  });
  
  return '<div class="crypto-widget" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:24px;text-align:center;color:#fff;max-width:380px;margin:0 auto;font-family:Arial,sans-serif;">' +
    '<h3 style="margin:0 0 20px;font-size:24px;color:#f0b90b;">Pay with Crypto</h3>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">You donate:</p>' +
      '<p style="margin:0;font-size:36px;font-weight:bold;color:#fff;">$' + usdAmount + '</p>' +
    '</div>' +
    '<div style="margin-bottom:16px;text-align:left;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Choose crypto:</p>' +
      '<select id="crypto-select" onchange="changeCrypto(' + usdAmount + ')" style="width:100%;padding:12px;border-radius:8px;background:#16213e;color:#fff;border:2px solid #f0b90b;font-size:16px;font-weight:bold;">' +
        options +
      '</select>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Amount to pay:</p>' +
      '<p id="crypto-amount-display" style="margin:0;font-size:28px;font-weight:bold;color:' + info.c + ';">$' + usdAmount + ' USD</p>' +
    '</div>' +
    '<button id="gen-btn" onclick="generatePayment(\'' + cryptoName.toLowerCase() + '\',' + usdAmount + ')" style="background:#f0b90b;color:#000;border:none;padding:14px 24px;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;width:100%;">Generate Payment →</button>' +
    '<button onclick="closeCryptoWidget()" style="margin-top:8px;background:transparent;color:#aaa;border:1px solid #555;padding:10px;border-radius:8px;cursor:pointer;width:100%;">← Change Amount</button>' +
  '</div>';
}

// Create payment address view - Step 2: Show address with copy button
function createPaymentView(usdAmount, crypto, payAddress, payAmount, paymentId) {
  const info = getCryptoInfo(crypto.toUpperCase());
  const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(payAddress);
  
  return '<div class="crypto-widget" style="background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:16px;padding:24px;text-align:center;color:#fff;max-width:380px;margin:0 auto;font-family:Arial,sans-serif;">' +
    '<h3 style="margin:0 0 20px;font-size:24px;color:#f0b90b;">Send Crypto</h3>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">You donate:</p>' +
      '<p style="margin:0;font-size:36px;font-weight:bold;color:#fff;">$' + usdAmount + '</p>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Send exactly:</p>' +
      '<p style="margin:0;font-size:28px;font-weight:bold;color:' + info.c + ';">' + payAmount + ' ' + crypto.toUpperCase() + '</p>' +
    '</div>' +
    '<div style="background:rgba(255,255,255,0.1);border-radius:12px;padding:16px;margin-bottom:16px;">' +
      '<p style="margin:0 0 8px;color:#aaa;font-size:14px;">Send to this address:</p>' +
      '<div style="display:flex;align-items:center;gap:8px;">' +
        '<p style="margin:0;font-size:12px;word-break:break-all;color:#fff;background:#16213e;padding:10px;border-radius:8px;flex:1;" id="wallet-address">' + payAddress + '</p>' +
        '<button onclick="copyAddress()" style="background:#f0b90b;color:#000;border:none;padding:10px 12px;border-radius:8px;font-size:16px;cursor:pointer;" title="Copy address">📋</button>' +
      '</div>' +
      '<p id="copy-msg" style="margin:8px 0 0;color:#4caf50;font-size:12px;display:none;">✓ Copied!</p>' +
    '</div>' +
    '<div style="margin-bottom:16px;">' +
      '<img src="' + qrUrl + '" style="width:150px;border-radius:8px;border:2px solid #fff;" />' +
    '</div>' +
    '<div id="crypto-status" style="background:rgba(255,193,7,0.2);border-radius:8px;padding:12px;margin-bottom:16px;">' +
      '<p style="margin:0;color:#ffc107;font-size:14px;">⏳ Waiting for payment...</p>' +
    '</div>' +
    '<button onclick="confirmPayment(\'' + paymentId + '\')" style="background:#4caf50;color:#fff;border:none;padding:14px 24px;border-radius:8px;font-weight:bold;font-size:16px;cursor:pointer;width:100%;">I Have Paid ✓</button>' +
    '<button onclick="showPaymentView()" style="margin-top:8px;background:transparent;color:#aaa;border:1px solid #555;padding:10px;border-radius:8px;cursor:pointer;width:100%;">← Back</button>' +
  '</div>';
}

// Generate Payment - Step 1
async function generatePayment(crypto, usdAmount) {
  const btnEl = document.getElementById('gen-btn');
  const amountEl = document.getElementById('crypto-amount-display');
  
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = 'Generating...';
  }
  if (amountEl) amountEl.textContent = 'Loading...';
  
  try {
    const resp = await fetch('/api/nowpayment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_amount: usdAmount,
        pay_currency: crypto.toLowerCase()
      })
    });
    
    const data = await resp.json();
    
    if (data && data.pay_address) {
      // Store payment data
      currentPaymentData = {
        usdAmount: usdAmount,
        crypto: crypto,
        payAddress: data.pay_address,
        payAmount: data.pay_amount,
        paymentId: data.payment_id
      };
      
      // Show payment view
      const modal = document.getElementById('modal-doacao');
      if (!modal) return;
      const container = modal.querySelector('.select-amount');
      if (!container) return;
      container.innerHTML = createPaymentView(usdAmount, crypto, data.pay_address, data.pay_amount, data.payment_id);
    } else {
      alert('Failed to generate payment. Please try again.');
      if (btnEl) {
        btnEl.disabled = false;
        btnEl.textContent = 'Generate Payment →';
      }
    }
  } catch (e) {
    alert('Error: ' + e.message);
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = 'Generate Payment →';
    }
  }
}

// Show payment view again (from back button)
function showPaymentView() {
  if (currentPaymentData.payAddress) {
    const modal = document.getElementById('modal-doacao');
    if (!modal) return;
    const container = modal.querySelector('.select-amount');
    if (!container) return;
    container.innerHTML = createPaymentView(
      currentPaymentData.usdAmount,
      currentPaymentData.crypto,
      currentPaymentData.payAddress,
      currentPaymentData.payAmount,
      currentPaymentData.paymentId
    );
  }
}

// Confirm Payment - Step 3: Check status
function confirmPayment(paymentId) {
  const statusEl = document.getElementById('crypto-status');
  if (statusEl) {
    statusEl.innerHTML = '<p style="margin:0;color:#2196f3;">⏳ Checking payment...</p>';
  }
  
  checkPaymentStatus(paymentId);
}

// Check payment status
async function checkPaymentStatus(paymentId) {
  const statusEl = document.getElementById('crypto-status');
  if (!statusEl) return;
  
  const interval = setInterval(async function() {
    try {
      const resp = await fetch('/api/nowpayment?payment_id=' + paymentId);
      const data = await resp.json();
      
      if (data && (data.payment_status === 'confirmed' || data.payment_status === 'finished')) {
        clearInterval(interval);
        statusEl.innerHTML = '<p style="margin:0;color:#4caf50;font-size:16px;font-weight:bold;">✓ Payment Confirmed! Thank you!</p>';
        showPaymentSuccess();
      } else if (data && data.payment_status === 'failed') {
        clearInterval(interval);
        statusEl.innerHTML = '<p style="margin:0;color:#f44336;">✗ Payment failed</p>';
      } else if (data && data.payment_status) {
        statusEl.innerHTML = '<p style="margin:0;color:#ffc107;">⏳ Status: ' + data.payment_status + ' - Waiting for confirmation...</p>';
      }
    } catch (e) {
      statusEl.innerHTML = '<p style="margin:0;color:#ff9800;">⏳ Checking...</p>';
    }
  }, 5000);
}

// Show success
function showPaymentSuccess() {
  const toast = document.getElementById('toast-success');
  if (toast) {
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(function() {
      toast.classList.remove('show');
      toast.classList.add('hidden');
    }, 5000);
  }
  const modal = document.getElementById('modal-doacao');
  if (modal) {
    const sel = modal.querySelector('.select-amount');
    const thx = modal.querySelector('.thanks');
    if (sel) sel.classList.add('hidden');
    if (thx) thx.classList.remove('hidden');
  }
}

// Change crypto selection
function changeCrypto(usdAmount) {
  const select = document.getElementById('crypto-select');
  if (!select) return;
  const modal = document.getElementById('modal-doacao');
  if (!modal) return;
  const container = modal.querySelector('.select-amount');
  if (!container) return;
  container.innerHTML = createCryptoWidget(usdAmount, select.value);
}

// Close and reload
function closeCryptoWidget() {
  location.reload();
}

// Show crypto widget
function showCryptoWidget(amount, crypto) {
  const modal = document.getElementById('modal-doacao');
  if (!modal) return;
  const container = modal.querySelector('.select-amount');
  if (!container) return;
  container.innerHTML = createCryptoWidget(amount, crypto);
  container.classList.remove('hidden');
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
window.generatePayment = generatePayment;
window.confirmPayment = confirmPayment;
window.showPaymentView = showPaymentView;
window.copyAddress = copyAddress;
window.closeCryptoWidget = closeCryptoWidget;
window.createCryptoWidget = createCryptoWidget;
window.changeCrypto = changeCrypto;

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
  
  // Amount buttons
  var amountBtns = document.querySelectorAll('.valor-btn[data-amount]');
  amountBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var amount = parseFloat(btn.getAttribute('data-amount'));
      if (amount && amount > 0) {
        localStorage.setItem('amount-selected', amount);
        var customInput = document.getElementById('custom-amount-input');
        if (customInput) customInput.value = amount;
        showCryptoWidget(amount, 'btc');
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
          showCryptoWidget(amount, 'btc');
        }
      }
    });
  }
});

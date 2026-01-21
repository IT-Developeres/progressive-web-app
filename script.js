// PWA Install Prompt
let deferredPrompt;
let isAppInstalled = false;

// Check if app is already installed
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
    // show banner if not dismissed and not installed
    if (!localStorage.getItem('installBannerDismissed')) {
        showInstallBanner();
    }
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    isAppInstalled = true;
    hideInstallButton();
    showNotification('App installed successfully!');
    // hide banner permanently after install
    try { localStorage.setItem('installBannerDismissed', 'true'); } catch (e) {}
    hideInstallBanner();
});

// Check if app is in standalone mode (already installed)
window.addEventListener('load', () => {
    if (window.navigator.standalone === true) {
        isAppInstalled = true;
        hideInstallButton();
    }
    // Register Service Worker
    registerServiceWorker();
    // If the banner was previously dismissed, ensure it's hidden
    if (localStorage.getItem('installBannerDismissed')) {
        hideInstallBanner();
    }
});

// Show Install Button
function showInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'flex';
    }
}

// Banner controls
function showInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (!banner) return;
    banner.style.display = 'flex';
    // small timeout to allow animation class
    setTimeout(() => banner.classList.add('show'), 10);
}

function hideInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (!banner) return;
    banner.classList.remove('show');
    setTimeout(() => { banner.style.display = 'none'; }, 220);
}

function dismissInstallBanner() {
    try { localStorage.setItem('installBannerDismissed', 'true'); } catch (e) {}
    hideInstallBanner();
}

// Hide Install Button
function hideInstallButton() {
    const installBtn = document.getElementById('installBtn');
    if (installBtn) {
        installBtn.style.display = 'none';
    }
}

// Install App Function
function installApp() {
    if (!deferredPrompt) {
        alert('App is already installed or not available for installation');
        return;
    }
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            showNotification('Installing TechStore app...');
            // hide banner after user accepts
            try { localStorage.setItem('installBannerDismissed', 'true'); } catch (e) {}
            hideInstallBanner();
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
}

// Register Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('[App] Service Worker registered successfully:', registration);
                
                // Store registration globally for later use
                window.swRegistration = registration;
                
                // Check for updates periodically
                setInterval(() => {
                    registration.update();
                }, 60000); // Check every minute

                // Check for updates on visibility
                document.addEventListener('visibilitychange', () => {
                    if (!document.hidden) {
                        registration.update();
                    }
                });

                // Get current cache version
                getCacheVersion();
            })
            .catch((error) => {
                console.log('[App] Service Worker registration failed:', error);
            });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[App] Service Worker updated');
            showNotification('🔄 App updated! Refresh to see changes.', 5000);
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'CACHE_UPDATED') {
                showNotification('App updated! Refresh to see changes.');
            }
        });
    }
}

// Get current cache version from Service Worker
function getCacheVersion() {
    if (navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage({
            type: 'GET_CACHE_VERSION'
        }, [channel.port2]);

        channel.port1.onmessage = (event) => {
            console.log('[App] Current cache version:', event.data.cacheVersion);
            console.log('[App] Cache name:', event.data.cacheName);
            // Store in sessionStorage to check updates
            sessionStorage.setItem('appCacheVersion', event.data.cacheVersion);
        };
    }
}

// Clear cache manually
function clearAppCache() {
    if (navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_CACHE'
        }, [channel.port2]);

        channel.port1.onmessage = (event) => {
            if (event.data.success) {
                console.log('[App]', event.data.message);
                showNotification('✅ Cache cleared! Please refresh the page.', 3000);
            }
        };
    } else {
        showNotification('⚠️ Service Worker not ready yet.', 3000);
    }
}

// Offline/Online Detection
window.addEventListener('online', () => {
    console.log('[App] App is now online');
    showNotification('✅ You are online', 3000);
    document.body.classList.remove('offline-mode');
});

window.addEventListener('offline', () => {
    console.log('[App] App is now offline');
    showNotification('📡 You are offline - cached content only', 4000);
    document.body.classList.add('offline-mode');
});

// Check initial online status
document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.onLine) {
        document.body.classList.add('offline-mode');
        showNotification('📡 You are offline - cached content only', 4000);
    }
});

// Function to show offline badge if offline
function checkOnlineStatus() {
    if (!navigator.onLine) {
        const header = document.querySelector('.header');
        if (header && !document.getElementById('offline-badge')) {
            const badge = document.createElement('div');
            badge.id = 'offline-badge';
            badge.className = 'offline-badge';
            badge.textContent = '📡 Offline Mode';
            header.appendChild(badge);
        }
    } else {
        const badge = document.getElementById('offline-badge');
        if (badge) badge.remove();
    }
}

// Update status periodically
setInterval(checkOnlineStatus, 5000);


const products = [
    {
        id: 1,
        name: "Pro Laptop X1",
        category: "laptop",
        price: 1299.99,
        rating: "4.8",
        description: "High-performance laptop for professionals",
        icon: "fas fa-laptop",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop"
    },
    {
        id: 2,
        name: "Ultra Phone 12",
        category: "phone",
        price: 899.99,
        rating: "4.7",
        description: "Latest flagship smartphone",
        icon: "fas fa-mobile-alt",
        image: "https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=500&fit=crop"
    },
    {
        id: 3,
        name: "Wireless Earbuds Pro",
        category: "accessory",
        price: 199.99,
        rating: "4.6",
        description: "Premium noise-cancelling earbuds",
        icon: "fas fa-headphones",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
    },
    {
        id: 4,
        name: "Gaming Laptop Beast",
        category: "laptop",
        price: 1799.99,
        rating: "4.9",
        description: "Ultimate gaming performance",
        icon: "fas fa-gamepad",
        image: "https://images.unsplash.com/photo-1588872657840-218e412ee5ff?w=500&h=500&fit=crop"
    },
    {
        id: 5,
        name: "SmartPhone Max",
        category: "phone",
        price: 999.99,
        rating: "4.8",
        description: "Powerful and elegant smartphone",
        icon: "fas fa-smartphone",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop"
    },
    {
        id: 6,
        name: "USB-C Hub",
        category: "accessory",
        price: 49.99,
        rating: "4.5",
        description: "Multi-port USB-C hub",
        icon: "fas fa-plug",
        image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop"
    },
    {
        id: 7,
        name: "Business Laptop Pro",
        category: "laptop",
        price: 999.99,
        rating: "4.7",
        description: "Portable and powerful for business",
        icon: "fas fa-briefcase",
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop"
    },
    {
        id: 8,
        name: "Camera Phone Plus",
        category: "phone",
        price: 799.99,
        rating: "4.8",
        description: "Professional camera smartphone",
        icon: "fas fa-camera",
        image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop"
    },
    {
        id: 9,
        name: "Phone Case Premium",
        category: "accessory",
        price: 29.99,
        rating: "4.4",
        description: "Protective phone case",
        icon: "fas fa-shield-alt",
        image: "https://images.unsplash.com/photo-1592286927505-1def25115558?w=500&h=500&fit=crop"
    },
    {
        id: 10,
        name: "Creator Laptop Studio",
        category: "laptop",
        price: 2199.99,
        rating: "4.9",
        description: "For video and photo creators",
        icon: "fas fa-film",
        image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=500&h=500&fit=crop"
    },
    {
        id: 11,
        name: "Budget Phone Basic",
        category: "phone",
        price: 349.99,
        rating: "4.3",
        description: "Affordable reliable phone",
        icon: "fas fa-phone",
        image: "https://images.unsplash.com/photo-1574812261711-4a4ebab1c04d?w=500&h=500&fit=crop"
    },
    {
        id: 12,
        name: "Screen Protector Pack",
        category: "accessory",
        price: 14.99,
        rating: "4.2",
        description: "Glass screen protectors (3-pack)",
        icon: "fas fa-search",
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&h=500&fit=crop"
    }
];

// Shopping Cart
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentFilter = 'all';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
    updateCartCount();
});

// Display Products
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToShow.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image" style="background-image: url('${product.image}');">
                <div class="product-icon"><i class="${product.icon}"></i></div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-rating"><i class="fas fa-star"></i> ${product.rating} (128 reviews)</div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Filter Products
function filterProducts(category) {
    currentFilter = category;
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
    showNotification(`${product.name} added to cart!`);
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCart();
}

// Update Quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCart();
        }
    }
}

// Save Cart to LocalStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update Cart Display
function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    updateCartCount();

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
        cartTotal.textContent = '0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-from-cart-btn" onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartItems.appendChild(cartItem);
    });

    cartTotal.textContent = total.toFixed(2);
}

// Update Cart Count
function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
}

// Toggle Cart Sidebar
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.toggle('active');
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Order confirmed!\nTotal: $${total.toFixed(2)}\n\nThank you for your purchase!`);
    cart = [];
    saveCart();
    updateCart();
    toggleCart();
}

// Handle Contact Form
function handleContactSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

// Notification Function
function showNotification(message, duration = 2000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #667eea;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

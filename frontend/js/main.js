// ===== DOM ELEMENTS =====
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.querySelector('.nav-menu');
const signinBtn = document.getElementById('signinBtn');
const signupBtn = document.getElementById('signupBtn');
const signinModal = document.getElementById('signinModal');
const signupModal = document.getElementById('signupModal');
const closeModals = document.querySelectorAll('.close-modal');
const switchToSignup = document.getElementById('switchToSignup');
const switchToSignin = document.getElementById('switchToSignin');
const searchBtn = document.getElementById('searchBtn');
const movieSearch = document.getElementById('movieSearch');
const loadingOverlay = document.getElementById('loadingOverlay');

// ===== MOBILE MENU TOGGLE =====
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileMenuToggle.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        navMenu.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// ===== MODAL FUNCTIONS =====
function openModal(modal) {
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '15px'; // Prevent layout shift
    }
}

function closeModal(modal) {
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0';
    }
}

// ===== MODAL EVENT LISTENERS =====
if (signinBtn) {
    signinBtn.addEventListener('click', () => openModal(signinModal));
}

if (signupBtn) {
    signupBtn.addEventListener('click', () => {
        // Check if auth module exists and user is logged in
        if (window.auth && window.auth.currentUser) {
            window.auth.signOut();
        } else {
            openModal(signupModal);
        }
    });
}

if (closeModals) {
    closeModals.forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
}

// Switch between signin and signup modals
if (switchToSignup) {
    switchToSignup.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signinModal);
        openModal(signupModal);
    });
}

if (switchToSignin) {
    switchToSignin.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(signupModal);
        openModal(signinModal);
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target);
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                closeModal(modal);
            }
        });
    }
});

// ===== SEARCH FUNCTIONALITY =====
if (searchBtn && movieSearch) {
    searchBtn.addEventListener('click', handleSearch);
    
    // Allow Enter key to trigger search
    movieSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
}

function handleSearch() {
    const searchTerm = movieSearch.value.trim();
    if (searchTerm) {
        // Add search animation
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
        
        // Call the recommendation function
        if (typeof window.getRecommendations === 'function') {
            setTimeout(() => {
                window.getRecommendations(searchTerm);
                searchBtn.innerHTML = '<i class="fas fa-magic"></i> Get Recommendations';
                searchBtn.disabled = false;
            }, 300);
        } else {
            console.error('Recommendations function not loaded');
            alert('Recommendations system is not loaded. Please refresh the page.');
            searchBtn.innerHTML = '<i class="fas fa-magic"></i> Get Recommendations';
            searchBtn.disabled = false;
        }
    } else {
        alert('Please enter a movie name to get recommendations.');
        movieSearch.focus();
    }
}

// Quick search function for suggestions
function searchQuick(movieName) {
    if (movieSearch) {
        movieSearch.value = movieName;
        handleSearch();
    }
}

// Make searchQuick available globally
window.searchQuick = searchQuick;

// ===== LOADING OVERLAY FUNCTIONS =====
function showLoading(message = 'Finding Your Perfect Movies...') {
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('h3');
        if (loadingText && message) {
            loadingText.textContent = message;
        }
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Make loading functions available globally
window.showLoading = showLoading;
window.hideLoading = hideLoading;

// ===== FORM HANDLING =====
// Sign in form
if (document.getElementById('signinForm')) {
    document.getElementById('signinForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading state
        const submitBtn = e.target.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitBtn.disabled = true;
        
        // Use auth module if available
        if (window.auth && window.auth.signIn) {
            window.auth.signIn(email, password)
                .then(() => {
                    closeModal(signinModal);
                    showNotification('Successfully signed in!', 'success');
                })
                .catch(err => {
                    showNotification('Sign in failed. Using demo mode.', 'warning');
                    closeModal(signinModal);
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    e.target.reset();
                });
        } else {
            // Mock authentication
            setTimeout(() => {
                showNotification('Sign in would connect to backend in production', 'info');
                closeModal(signinModal);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                e.target.reset();
            }, 1000);
        }
    });
}

// Sign up form
if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('emailSignup').value;
        const password = document.getElementById('passwordSignup').value;
        
        // Show loading state
        const submitBtn = e.target.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitBtn.disabled = true;
        
        // Use auth module if available
        if (window.auth && window.auth.signUp) {
            window.auth.signUp(name, email, password)
                .then(() => {
                    closeModal(signupModal);
                    showNotification('Account created successfully!', 'success');
                })
                .catch(err => {
                    showNotification('Sign up failed. Using demo mode.', 'warning');
                    closeModal(signupModal);
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    e.target.reset();
                });
        } else {
            // Mock authentication
            setTimeout(() => {
                showNotification('Account creation would connect to backend in production', 'info');
                closeModal(signupModal);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                e.target.reset();
            }, 1000);
        }
    });
}

// Contact form (if exists on current page)
if (document.getElementById('contactForm')) {
    document.getElementById('contactForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = e.target.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            e.target.reset();
        }, 1500);
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Set icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 2000;
            animation: slideInRight 0.3s ease, fadeOut 0.3s ease 3s forwards;
            border-left: 4px solid #3498db;
            max-width: 400px;
        }
        
        .notification-success {
            border-left-color: #27ae60;
        }
        
        .notification-warning {
            border-left-color: #f39c12;
        }
        
        .notification-error {
            border-left-color: #e74c3c;
        }
        
        .notification i:first-child {
            font-size: 1.2rem;
        }
        
        .notification-success i:first-child {
            color: #27ae60;
        }
        
        .notification-warning i:first-child {
            color: #f39c12;
        }
        
        .notification-error i:first-child {
            color: #e74c3c;
        }
        
        .notification span {
            flex: 1;
            font-weight: 500;
        }
        
        .notification-close {
            background: none;
            border: none;
            color: #7f8c8d;
            cursor: pointer;
            padding: 5px;
            border-radius: 4px;
            transition: background-color 0.3s;
        }
        
        .notification-close:hover {
            background-color: #f0f0f0;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Add close functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Make notification function available globally
window.showNotification = showNotification;

// ===== ACTIVE NAV LINK HIGHLIGHTING =====
function highlightActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Highlight active nav link
    highlightActiveNavLink();
    
    // Focus on search input on home page
    if (movieSearch && window.location.pathname.includes('index.html')) {
        setTimeout(() => {
            movieSearch.focus();
        }, 500);
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Initialize tooltips for icons
    document.querySelectorAll('[title]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.position = 'fixed';
            tooltip.style.top = (rect.top - 40) + 'px';
            tooltip.style.left = (rect.left + rect.width/2 - tooltip.offsetWidth/2) + 'px';
            tooltip.style.backgroundColor = 'rgba(0,0,0,0.8)';
            tooltip.style.color = 'white';
            tooltip.style.padding = '5px 10px';
            tooltip.style.borderRadius = '4px';
            tooltip.style.fontSize = '0.85rem';
            tooltip.style.zIndex = '10000';
            tooltip.style.whiteSpace = 'nowrap';
            
            this.tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this.tooltip) {
                this.tooltip.remove();
                this.tooltip = null;
            }
        });
    });
    
    // Log initialization
    console.log('MovieRec UI initialized successfully!');
});
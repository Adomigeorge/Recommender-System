// ===== AUTHENTICATION MODULE =====
const auth = {
    // Current user state
    currentUser: null,
    
    // Mock users database (in production, this would be on a server)
    mockUsers: [
        {
            id: 1,
            email: 'demo@movierec.com',
            name: 'Demo User',
            password: 'demo123',
            preferences: {
                favoriteGenres: ['Action', 'Sci-Fi', 'Drama'],
                watchedMovies: [1, 2, 3]
            }
        }
    ],
    
    // Initialize auth state from localStorage
    init() {
        const savedUser = localStorage.getItem('movieRecUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                console.log('👤 User loaded from storage:', this.currentUser.name);
            } catch (e) {
                console.error('Error loading user from storage:', e);
                localStorage.removeItem('movieRecUser');
            }
        }
        this.updateAuthUI();
    },
    
    // Sign in function
    signIn(email, password) {
        return new Promise((resolve, reject) => {
            // Simulate API delay
            setTimeout(() => {
                // Check mock users
                const user = this.mockUsers.find(u => 
                    u.email === email && u.password === password
                );
                
                if (user) {
                    // Create user object without password
                    this.currentUser = {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        preferences: user.preferences
                    };
                    
                    // Save to localStorage
                    localStorage.setItem('movieRecUser', JSON.stringify(this.currentUser));
                    
                    this.updateAuthUI();
                    resolve(this.currentUser);
                } else {
                    reject(new Error('Invalid email or password'));
                }
            }, 1000);
        });
    },
    
    // Sign up function
    signUp(name, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if user already exists
                const existingUser = this.mockUsers.find(u => u.email === email);
                if (existingUser) {
                    reject(new Error('User already exists'));
                    return;
                }
                
                // Create new user
                const newUser = {
                    id: Date.now(),
                    email,
                    name,
                    password,
                    preferences: {
                        favoriteGenres: [],
                        watchedMovies: []
                    }
                };
                
                // Add to mock database
                this.mockUsers.push(newUser);
                
                // Set as current user (without password)
                this.currentUser = {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    preferences: newUser.preferences
                };
                
                // Save to localStorage
                localStorage.setItem('movieRecUser', JSON.stringify(this.currentUser));
                
                this.updateAuthUI();
                resolve(this.currentUser);
            }, 1000);
        });
    },
    
    // Sign out function
    signOut() {
        this.currentUser = null;
        localStorage.removeItem('movieRecUser');
        this.updateAuthUI();
        if (window.showNotification) {
            window.showNotification('Signed out successfully', 'success');
        }
    },
    
    // Update authentication UI
    updateAuthUI() {
        const signinBtn = document.getElementById('signinBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        if (!signinBtn || !signupBtn) return;
        
        if (this.currentUser) {
            // User is logged in
            signinBtn.innerHTML = `
                <i class="fas fa-user-circle"></i>
                <span class="user-name">${this.currentUser.name.split(' ')[0]}</span>
            `;
            signupBtn.innerHTML = `
                <i class="fas fa-sign-out-alt"></i> Sign Out
            `;
            
            // Add user menu on click
            signinBtn.onclick = (e) => {
                e.stopPropagation();
                this.showUserMenu(signinBtn);
            };
            
            signupBtn.onclick = () => this.signOut();
            
            // Add styles for logged-in state
            this.addAuthStyles();
            
        } else {
            // User is not logged in
            signinBtn.innerHTML = `
                <i class="fas fa-user"></i> Sign In
            `;
            signupBtn.innerHTML = `
                <i class="fas fa-user-plus"></i> Sign Up
            `;
            
            signinBtn.onclick = () => {
                if (window.openModal) {
                    window.openModal(document.getElementById('signinModal'));
                }
            };
            
            signupBtn.onclick = () => {
                if (window.openModal) {
                    window.openModal(document.getElementById('signupModal'));
                }
            };
            
            // Remove user menu if exists
            const existingMenu = document.querySelector('.user-menu');
            if (existingMenu) {
                existingMenu.remove();
            }
        }
    },
    
    // Show user menu dropdown
    showUserMenu(button) {
        // Remove existing menu
        const existingMenu = document.querySelector('.user-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }
        
        // Create menu
        const menu = document.createElement('div');
        menu.className = 'user-menu';
        menu.innerHTML = `
            <div class="user-menu-header">
                <div class="user-avatar">
                    ${this.currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div class="user-info">
                    <h4>${this.currentUser.name}</h4>
                    <p>${this.currentUser.email}</p>
                </div>
            </div>
            <div class="user-menu-items">
                <a href="#" class="menu-item" onclick="auth.goToProfile()">
                    <i class="fas fa-user"></i> My Profile
                </a>
                <a href="#" class="menu-item" onclick="auth.viewWatchlist()">
                    <i class="fas fa-bookmark"></i> Watchlist
                </a>
                <a href="#" class="menu-item" onclick="auth.viewHistory()">
                    <i class="fas fa-history"></i> History
                </a>
                <div class="menu-divider"></div>
                <a href="#" class="menu-item" onclick="auth.signOut()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </a>
            </div>
        `;
        
        // Position menu
        const rect = button.getBoundingClientRect();
        menu.style.position = 'fixed';
        menu.style.top = (rect.bottom + 10) + 'px';
        menu.style.right = (window.innerWidth - rect.right) + 'px';
        
        document.body.appendChild(menu);
        
        // Close menu when clicking outside
        setTimeout(() => {
            const closeMenu = (e) => {
                if (!menu.contains(e.target) && e.target !== button) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            document.addEventListener('click', closeMenu);
        }, 0);
    },
    
    // Add authentication styles
    addAuthStyles() {
        const styleId = 'auth-styles';
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .user-name {
                font-weight: 600;
                margin-left: 5px;
            }
            
            .user-menu {
                position: fixed;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                z-index: 1001;
                min-width: 250px;
                animation: slideDown 0.3s ease;
                overflow: hidden;
            }
            
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .user-menu-header {
                padding: 1.5rem;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                gap: 1rem;
            }
            
            .user-avatar {
                width: 50px;
                height: 50px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                font-weight: bold;
            }
            
            .user-info h4 {
                margin: 0 0 0.25rem 0;
                font-size: 1.1rem;
            }
            
            .user-info p {
                margin: 0;
                opacity: 0.9;
                font-size: 0.9rem;
            }
            
            .user-menu-items {
                padding: 0.5rem 0;
            }
            
            .menu-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 0.75rem 1.5rem;
                color: #333;
                text-decoration: none;
                transition: all 0.3s;
            }
            
            .menu-item:hover {
                background: #f5f5f5;
                color: #3498db;
            }
            
            .menu-item i {
                width: 20px;
                text-align: center;
            }
            
            .menu-divider {
                height: 1px;
                background: #e0e0e0;
                margin: 0.5rem 1.5rem;
            }
        `;
        
        document.head.appendChild(style);
    },
    
    // User menu actions
    goToProfile() {
        if (window.showNotification) {
            window.showNotification('Profile page would open here', 'info');
        }
    },
    
    viewWatchlist() {
        if (window.showNotification) {
            window.showNotification('Watchlist feature coming soon!', 'info');
        }
    },
    
    viewHistory() {
        if (window.showNotification) {
            window.showNotification('Viewing history feature coming soon!', 'info');
        }
    },
    
    // Save user preference (movie rating, watchlist, etc.)
    savePreference(movieId, action, data = {}) {
        if (!this.currentUser) {
            if (window.showNotification) {
                window.showNotification('Please sign in to save preferences', 'warning');
            }
            return false;
        }
        
        // In production, this would make an API call
        console.log('Saving preference:', {
            userId: this.currentUser.id,
            movieId,
            action,
            data,
            timestamp: new Date().toISOString()
        });
        
        // Update local storage
        if (action === 'rate') {
            // Save rating
            const ratings = JSON.parse(localStorage.getItem('movieRatings') || '{}');
            ratings[movieId] = data.rating;
            localStorage.setItem('movieRatings', JSON.stringify(ratings));
        } else if (action === 'watchlist') {
            // Save to watchlist
            const watchlist = JSON.parse(localStorage.getItem('movieWatchlist') || '[]');
            if (!watchlist.includes(movieId)) {
                watchlist.push(movieId);
                localStorage.setItem('movieWatchlist', JSON.stringify(watchlist));
            }
        }
        
        if (window.showNotification) {
            window.showNotification(`Movie ${action} saved!`, 'success');
        }
        
        return true;
    },
    
    // Get user preferences
    getPreferences() {
        if (!this.currentUser) return null;
        
        const ratings = JSON.parse(localStorage.getItem('movieRatings') || '{}');
        const watchlist = JSON.parse(localStorage.getItem('movieWatchlist') || '[]');
        
        return {
            ratings,
            watchlist,
            ...this.currentUser.preferences
        };
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔐 Auth module initializing...');
    auth.init();
    console.log('✅ Auth module ready!');
});

// ===== EXPORT AUTH MODULE =====
window.auth = auth;
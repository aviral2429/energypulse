/**
 * theme.js
 * Handles dark/light theme toggling and persists preference.
 */

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.sunIcon = this.themeToggle ? this.themeToggle.querySelector('.sun-icon') : null;
        this.moonIcon = this.themeToggle ? this.themeToggle.querySelector('.moon-icon') : null;
        
        this.init();
    }
    
    init() {
        // Check local storage or system preference
        const savedTheme = localStorage.getItem('energypulse_theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
            this.setTheme(prefersLight ? 'light' : 'dark');
        }
        
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('energypulse_theme', theme);
        
        if (this.sunIcon && this.moonIcon) {
            if (theme === 'light') {
                this.sunIcon.style.display = 'none';
                this.moonIcon.style.display = 'block';
            } else {
                this.sunIcon.style.display = 'block';
                this.moonIcon.style.display = 'none';
            }
        }
        
        // Dispatch custom event so charts can re-render if needed
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        
        // Optional: Save to Firestore if user is logged in
        if (window.db && window.auth && window.auth.currentUser) {
            window.db.collection('users').doc(window.auth.currentUser.uid).set({
                theme: theme
            }, { merge: true }).catch(console.error);
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        this.setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.themeManager = new ThemeManager();
    } catch (e) {
        console.warn('ThemeManager init error:', e);
    }
});

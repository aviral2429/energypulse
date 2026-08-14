/**
 * dashboard.js
 * Main application controller, handles auth, navigation, and data fetching.
 */

class DashboardController {
    constructor() {
        this.db = window.db || null;
        this.auth = window.auth || null;
        
        this.views = document.querySelectorAll('.view');
        this.navItems = document.querySelectorAll('.nav-item');
        this.pageTitle = document.getElementById('page-title');
        
        this.unsubscribeDevices = null;
        this.unsubscribeAlerts = null;
        this.isSigningOut = false;
        
        this.init();
    }
    
    init() {
        // Setup Sidebar Toggle
        const sidebar = document.getElementById('sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                // Force chart resize
                setTimeout(() => { if (window.chartManager) window.chartManager.resizeCharts(); }, 300);
            });
        }
        
        // Setup Navigation
        this.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const viewName = item.getAttribute('data-view');
                this.switchView(viewName);
            });
        });

        // View All Alerts link
        const viewAllAlerts = document.querySelector('.view-all');
        if (viewAllAlerts) {
            viewAllAlerts.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchView('alerts');
            });
        }
        
        // Notifications button
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.switchView('alerts');
        });
        
        // Sign Out
        document.getElementById('btn-sign-out')?.addEventListener('click', () => {
            this.isSigningOut = true; // prevent onAuthStateChanged redirect
            if (this.auth) {
                this.auth.signOut().then(() => {
                    window.location.href = 'index.html';
                }).catch(() => {
                    window.location.href = 'index.html';
                });
            } else {
                window.location.href = 'index.html';
            }
        });

        // Handle Hash navigation on load
        const hash = window.location.hash.replace('#', '');
        if (hash) {
            this.switchView(hash);
        }

        // Initialize Data
        this.checkAuthAndLoadData();
    }
    
    switchView(viewName) {
        // Update Nav
        this.navItems.forEach(nav => nav.classList.remove('active'));
        const activeNav = document.querySelector(`.nav-item[data-view="${viewName}"]`);
        if (activeNav) activeNav.classList.add('active');
        
        // Update View - hide all, show selected
        this.views.forEach(view => {
            view.classList.remove('active');
        });
        
        const activeView = document.getElementById(`view-${viewName}`);
        if (activeView) {
            activeView.classList.add('active');
        }
        
        // Update Title
        if (activeNav) {
            this.pageTitle.innerText = activeNav.querySelector('.nav-text').innerText;
        }
        
        // Update URL hash without scroll jumping
        history.pushState(null, null, `#${viewName}`);
        
        // Resize charts if they are in the new view
        if (window.chartManager) {
            setTimeout(() => window.chartManager.resizeCharts(), 100);
        }
    }
    
    checkAuthAndLoadData() {
        if (this.auth) {
            this.auth.onAuthStateChanged(user => {
                if (user) {
                    this.updateUserProfile(user);
                    this.loadRealData(user.uid);
                    this.hideLoading();
                } else {
                    // Not logged in — only redirect if not already signing out
                    if (!this.isSigningOut) {
                        window.location.href = 'login.html';
                    }
                }
            });
        } else {
            console.warn("Firebase not initialized. Loading demo data.");
            this.updateUserProfile({ displayName: 'Demo User', email: 'demo@energypulse.com' });
            this.loadDemoData();
            this.hideLoading();
        }
    }
    
    updateUserProfile(user) {
        const nameEl = document.getElementById('user-name-display');
        const emailEl = document.getElementById('user-email-display');
        const avatarEl = document.getElementById('user-avatar-initials');
        
        const name = user.displayName || 'User';
        if (nameEl) nameEl.innerText = name;
        if (emailEl) emailEl.innerText = user.email || '';
        
        if (avatarEl) {
            avatarEl.innerText = name.substring(0, 2).toUpperCase();
        }
    }
    
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        }
    }
    
    loadDemoData() {
        if (!window.Utils) return;
        const data = window.Utils.generateDemoData();
        
        // Animate KPIs
        window.Utils.animateCounter(document.getElementById('kpi-total-energy'), 12540, 1500);
        window.Utils.animateCounter(document.getElementById('kpi-current-cost'), 106590, 1500);
        window.Utils.animateCounter(document.getElementById('kpi-carbon-emissions'), 4250, 1500);
        document.getElementById('kpi-active-devices').innerText = '145';
        
        // Devices
        if (window.deviceManager) window.deviceManager.renderDevices(data.devices);
        
        // Alerts
        if (window.alertManager) window.alertManager.renderAlerts(data.alerts);
        
        // Real-time Chart simulation
        if (window.chartManager) {
            let times = [...data.realtimeData.times];
            let values = [...data.realtimeData.values];
            let basePower = 95;
            
            window.chartManager.updateRealtimeChart(times, values);
            
            // Simulate live updates
            setInterval(() => {
                const now = new Date();
                times.shift();
                times.push(window.Utils.formatTime(now) + ':' + now.getSeconds().toString().padStart(2, '0'));
                
                values.shift();
                basePower = basePower + (Math.random() * 4 - 2);
                values.push(basePower.toFixed(1));
                
                window.chartManager.updateRealtimeChart(times, values);
            }, 5000);
        }
    }
    
    loadRealData(userId) {
        // Load settings
        this.db.collection('users').doc(userId).get().then(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data.theme && window.themeManager) {
                    window.themeManager.setTheme(data.theme);
                }
                // Fill settings form
                if (document.getElementById('setting-tariff')) document.getElementById('setting-tariff').value = data.tariffRate || 8.5;
            }
        });

        // Listen to devices
        this.unsubscribeDevices = this.db.collection('devices')
            .where('userId', '==', userId)
            .onSnapshot(snapshot => {
                if (snapshot.empty) {
                    // First time user, generate demo data and push to FB to make it look good
                    this.seedDemoData(userId);
                    return;
                }
                const devices = [];
                let activeCount = 0;
                snapshot.forEach(doc => {
                    const d = { id: doc.id, ...doc.data() };
                    devices.push(d);
                    if(d.status === 'online') activeCount++;
                });
                if (window.deviceManager) window.deviceManager.renderDevices(devices);
                document.getElementById('kpi-active-devices').innerText = activeCount;
                document.getElementById('kpi-devices-trend').innerText = `${activeCount}/${devices.length} Online`;
            });
            
        // Listen to alerts
        this.unsubscribeAlerts = this.db.collection('alerts')
            .where('userId', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(20)
            .onSnapshot(snapshot => {
                const alerts = [];
                snapshot.forEach(doc => alerts.push({ id: doc.id, ...doc.data() }));
                if (window.alertManager) window.alertManager.renderAlerts(alerts);
            });
            
        // For KPIs and Charts, since it's a demo, if we have real data we'll use it,
        // otherwise we fallback to demo simulation for the visualizations.
        this.loadDemoData(); 
    }
    
    seedDemoData(userId) {
        // Seed initial demo data to Firestore for a new user
        const data = window.Utils.generateDemoData();
        data.devices.forEach(d => {
            const copy = {...d};
            delete copy.id;
            copy.userId = userId;
            this.db.collection('devices').add(copy);
        });
        
        data.alerts.forEach(a => {
            const copy = {...a};
            delete copy.id;
            copy.userId = userId;
            this.db.collection('alerts').add(copy);
        });
    }
}

// Initialize when DOM is ready
(function() {
    function init() {
        // Wait slightly to ensure other managers are ready
        setTimeout(() => {
            window.dashboardController = new DashboardController();
        }, 150);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();


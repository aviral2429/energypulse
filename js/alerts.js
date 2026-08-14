/**
 * alerts.js
 * Manages alert logic and rendering.
 */

class AlertManager {
    constructor() {
        this.dashboardTable = document.getElementById('dashboard-alerts-table');
        this.fullTable = document.getElementById('full-alerts-table');
        this.badge = document.getElementById('notification-badge');
    }
    
    getSeverityBadge(severity) {
        const map = {
            'high': 'badge-high',
            'medium': 'badge-medium',
            'low': 'badge-low'
        };
        const cls = map[severity.toLowerCase()] || 'badge-low';
        return `<span class="badge-alert ${cls}">${severity.toUpperCase()}</span>`;
    }
    
    renderAlerts(alerts) {
        // Update badge
        const activeCount = alerts.filter(a => a.status === 'active').length;
        if (this.badge) {
            this.badge.innerText = activeCount;
            this.badge.style.display = activeCount > 0 ? 'block' : 'none';
        }
        
        // Sort by timestamp desc
        const sorted = [...alerts].sort((a, b) => b.timestamp - a.timestamp);
        
        // Dashboard table (last 5)
        if (this.dashboardTable) {
            const tbody = this.dashboardTable.querySelector('tbody');
            tbody.innerHTML = sorted.slice(0, 5).map(alert => `
                <tr>
                    <td>${window.Utils.formatTime(alert.timestamp)}</td>
                    <td>${alert.deviceName}</td>
                    <td>${alert.type}</td>
                    <td>${this.getSeverityBadge(alert.severity)}</td>
                    <td style="color: ${alert.status==='active' ? 'var(--error)' : 'var(--text-secondary)'}">${alert.status}</td>
                </tr>
            `).join('');
        }
        
        // Full table
        if (this.fullTable) {
            const tbody = this.fullTable.querySelector('tbody');
            tbody.innerHTML = sorted.map(alert => `
                <tr>
                    <td>${window.Utils.formatDate(alert.timestamp)} ${window.Utils.formatTime(alert.timestamp)}</td>
                    <td>${alert.deviceName}</td>
                    <td>${alert.type}</td>
                    <td>${alert.message}</td>
                    <td>${this.getSeverityBadge(alert.severity)}</td>
                    <td style="color: ${alert.status==='active' ? 'var(--error)' : 'var(--text-secondary)'}">${alert.status}</td>
                </tr>
            `).join('');
        }
    }
}

(function() {
    function init() { window.alertManager = new AlertManager(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

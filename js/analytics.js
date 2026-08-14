/**
 * analytics.js
 * Handles analytics view logic, exporting, and energy saving tips.
 */

class AnalyticsManager {
    constructor() {
        this.btnExport = document.getElementById('btn-export-csv');
        this.tipsList = document.getElementById('tips-list');
        this.init();
    }

    init() {
        if (this.btnExport) {
            this.btnExport.addEventListener('click', () => this.exportData());
        }
        this.populateTips();
    }

    exportData() {
        // Generate some demo data for export if no real data
        const demoData = [];
        const now = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(now.getTime() - i * 24 * 3600 * 1000);
            demoData.push({
                Date: window.Utils.formatDate(d),
                Energy_kWh: Math.floor(200 + Math.random() * 100),
                Cost_INR: Math.floor(1600 + Math.random() * 800),
                Carbon_kg: Math.floor(150 + Math.random() * 80)
            });
        }
        
        window.Utils.exportToCSV(demoData, `energy_report_${window.Utils.formatDate(new Date())}.csv`);
    }

    populateTips() {
        if (!this.tipsList) return;
        
        const tips = [
            "Your HVAC usage peaks at 2 PM. Consider pre-cooling rooms at 6 AM when rates are lower.",
            "Lighting in Block B remains active after 9 PM. Implement automated shut-off schedules.",
            "IT Infrastructure consumes 35% of total power. Review server idle states during weekends.",
            "Upgrade Main Library lighting to LED to save an estimated 15% on that building's load."
        ];
        
        this.tipsList.innerHTML = tips.map(tip => `
            <li style="margin-bottom: 12px; padding: 12px; background: rgba(0, 230, 118, 0.05); border-left: 3px solid var(--accent); border-radius: 4px; font-size: 0.9rem;">
                ${tip}
            </li>
        `).join('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});

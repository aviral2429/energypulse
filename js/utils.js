/**
 * utils.js
 * Helper functions for formatting, data generation, and general utilities.
 */

const Utils = {
    formatNumber(n) {
        return new Intl.NumberFormat('en-IN').format(n);
    },

    formatCurrency(n) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);
    },

    formatPower(kw) {
        return this.formatNumber(kw.toFixed(1)) + ' kW';
    },

    formatEnergy(kwh) {
        return this.formatNumber(kwh.toFixed(0)) + ' kWh';
    },

    formatCO2(kg) {
        return this.formatNumber(kg.toFixed(0)) + ' kg';
    },

    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    },

    formatTime(timestamp) {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit' }).format(date);
    },

    animateCounter(element, target, duration = 1000) {
        let startTimestamp = null;
        const startValue = parseFloat(element.innerText.replace(/[^0-9.-]+/g, "")) || 0;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            const current = startValue + progress * (target - startValue);
            
            // Format based on what's expected (hacky but works for the demo)
            if (element.id.includes('cost')) {
                element.innerText = this.formatCurrency(current);
            } else {
                element.innerText = this.formatNumber(Math.floor(current));
            }
            
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    },

    exportToCSV(data, filename) {
        if (!data || !data.length) return;
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(obj => Object.values(obj).join(',')).join('\n');
        const csv = `${headers}\n${rows}`;
        
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    generateDemoData() {
        const now = new Date();
        const devices = [
            { id: 'd1', name: 'Main HVAC Unit', type: 'HVAC', building: 'Block A', floor: 'Roof', status: 'online', threshold: 50, currentPower: 42.5, totalEnergy: 450 },
            { id: 'd2', name: 'Server Room AC', type: 'HVAC', building: 'Block B', floor: 'Basement', status: 'online', threshold: 15, currentPower: 12.1, totalEnergy: 280 },
            { id: 'd3', name: 'Library Lighting', type: 'Lighting', building: 'Main Library', floor: 'All', status: 'online', threshold: 10, currentPower: 8.4, totalEnergy: 95 },
            { id: 'd4', name: 'Chemistry Lab Equip', type: 'Lab Equipment', building: 'Block A', floor: '2', status: 'offline', threshold: 20, currentPower: 0, totalEnergy: 120 },
            { id: 'd5', name: 'Passenger Elevator 1', type: 'Elevator', building: 'Block B', floor: 'All', status: 'online', threshold: 15, currentPower: 4.2, totalEnergy: 65 },
            { id: 'd6', name: 'Data Center Racks', type: 'IT Infrastructure', building: 'Block B', floor: 'Basement', status: 'online', threshold: 30, currentPower: 28.5, totalEnergy: 680 }
        ];

        const alerts = [
            { id: 'a1', timestamp: new Date(now.getTime() - 15 * 60000), deviceName: 'Main HVAC Unit', type: 'High Usage', severity: 'high', status: 'active', message: 'Power draw exceeded 50kW threshold' },
            { id: 'a2', timestamp: new Date(now.getTime() - 2 * 3600000), deviceName: 'Chemistry Lab Equip', type: 'Device Offline', severity: 'medium', status: 'active', message: 'Device stopped responding' },
            { id: 'a3', timestamp: new Date(now.getTime() - 5 * 3600000), deviceName: 'Library Lighting', type: 'Anomaly', severity: 'low', status: 'resolved', message: 'Unusual usage pattern detected outside working hours' }
        ];
        
        // Generate timeline data for real-time chart (last 30 points)
        const realtimeData = { times: [], values: [] };
        let basePower = 95;
        for (let i = 30; i >= 0; i--) {
            const t = new Date(now.getTime() - i * 5000);
            realtimeData.times.push(this.formatTime(t) + ':' + t.getSeconds().toString().padStart(2, '0'));
            // random walk
            basePower = basePower + (Math.random() * 4 - 2);
            realtimeData.values.push(basePower.toFixed(1));
        }

        return { devices, alerts, realtimeData };
    }
};

window.Utils = Utils;

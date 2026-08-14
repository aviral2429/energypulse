/**
 * devices.js
 * Manages device logic and CRUD operations.
 */

class DeviceManager {
    constructor() {
        this.devicesGrid = document.getElementById('devices-grid');
        this.btnAddDevice = document.getElementById('btn-add-device');
        this.modalAddDevice = document.getElementById('modal-add-device');
        this.formAddDevice = document.getElementById('form-add-device');
        this.closeModalBtn = document.querySelector('.close-modal');
        
        this.init();
    }
    
    init() {
        if (!this.devicesGrid) return;
        
        // Modal events
        this.btnAddDevice.addEventListener('click', () => {
            this.modalAddDevice.classList.add('show');
        });
        
        this.closeModalBtn.addEventListener('click', () => {
            this.modalAddDevice.classList.remove('show');
            this.formAddDevice.reset();
        });
        
        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === this.modalAddDevice) {
                this.modalAddDevice.classList.remove('show');
            }
        });
        
        // Form submit
        this.formAddDevice.addEventListener('submit', (e) => this.handleAddDevice(e));
    }
    
    handleAddDevice(e) {
        e.preventDefault();
        
        const deviceData = {
            name: document.getElementById('dev-name').value,
            type: document.getElementById('dev-type').value,
            building: document.getElementById('dev-building').value,
            floor: document.getElementById('dev-floor').value,
            threshold: parseFloat(document.getElementById('dev-threshold').value),
            status: 'online',
            currentPower: 0,
            totalEnergy: 0,
            createdAt: window.firebase ? firebase.firestore.FieldValue.serverTimestamp() : new Date()
        };
        
        if (window.db && window.auth.currentUser) {
            deviceData.userId = window.auth.currentUser.uid;
            window.db.collection('devices').add(deviceData)
                .then(() => {
                    this.modalAddDevice.classList.remove('show');
                    this.formAddDevice.reset();
                    // Let the real-time listener update the UI
                })
                .catch(error => {
                    console.error("Error adding device: ", error);
                    alert("Error adding device. See console.");
                });
        } else {
            // Demo mode
            deviceData.id = 'demo-' + Date.now();
            this.renderDevice(deviceData);
            this.modalAddDevice.classList.remove('show');
            this.formAddDevice.reset();
        }
    }
    
    renderDevices(devices) {
        if (!this.devicesGrid) return;
        this.devicesGrid.innerHTML = '';
        devices.forEach(device => this.renderDevice(device));
    }
    
    renderDevice(device) {
        const card = document.createElement('div');
        card.className = 'device-card glass';
        card.id = `device-${device.id}`;
        
        const isOnline = device.status === 'online';
        
        card.innerHTML = `
            <div class="device-header">
                <div class="device-title">
                    <h4>${device.name}</h4>
                    <div class="device-location">${device.building}, Floor ${device.floor}</div>
                </div>
                <div class="device-status status-${isOnline ? 'online' : 'offline'}">
                    <div class="status-dot"></div>
                    ${isOnline ? 'Online' : 'Offline'}
                </div>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.8rem; margin-bottom: 12px;">Type: ${device.type}</div>
            <div class="device-stats">
                <div class="stat-box">
                    <div class="stat-val">${window.Utils ? window.Utils.formatPower(device.currentPower || 0) : (device.currentPower||0)+' kW'}</div>
                    <div class="stat-lbl">Current Draw</div>
                </div>
                <div class="stat-box">
                    <div class="stat-val">${window.Utils ? window.Utils.formatEnergy(device.totalEnergy || 0) : (device.totalEnergy||0)+' kWh'}</div>
                    <div class="stat-lbl">Energy Today</div>
                </div>
            </div>
            <div style="margin-top: 16px; display: flex; gap: 8px;">
                <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="window.deviceManager.deleteDevice('${device.id}')">Delete</button>
            </div>
        `;
        
        this.devicesGrid.appendChild(card);
    }
    
    deleteDevice(id) {
        if (confirm("Are you sure you want to delete this device?")) {
            if (window.db) {
                window.db.collection('devices').doc(id).delete()
                    .catch(error => console.error("Error removing device: ", error));
            } else {
                const el = document.getElementById(`device-${id}`);
                if (el) el.remove();
            }
        }
    }
}

(function() {
    function init() { window.deviceManager = new DeviceManager(); }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// DOM Elements
const statusEl = document.getElementById('status');
const devicesEl = document.getElementById('devices');
const refreshBtn = document.getElementById('refresh');
const deviceTemplate = document.getElementById('device-template');

// Status updates
function updateStatus(message, type = '') {
    statusEl.textContent = message;
    statusEl.className = 'status' + (type ? ` ${type}` : '');
}

// Create device element from template
function createDeviceElement(device) {
    const clone = deviceTemplate.content.cloneNode(true);
    
    clone.querySelector('.device-name').textContent = device.name;
    clone.querySelector('.busid').textContent = device.busId;
    clone.querySelector('.vid').textContent = device.vid;
    clone.querySelector('.pid').textContent = device.pid;
    
    const deviceEl = clone.querySelector('.device');
    const attachBtn = clone.querySelector('.attach');
    const detachBtn = clone.querySelector('.detach');
    
    attachBtn.onclick = () => attachDevice(device.busId);
    detachBtn.onclick = () => detachDevice(device.busId);
    
    return deviceEl;
}

// Update device list
function updateDeviceList(devices) {
    devicesEl.innerHTML = '';
    if (devices.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'status';
        emptyMessage.textContent = 'No USB devices found';
        devicesEl.appendChild(emptyMessage);
        return;
    }
    
    devices.forEach(device => {
        devicesEl.appendChild(createDeviceElement(device));
    });
}

// Device actions
async function attachDevice(busId) {
    try {
        updateStatus('Attaching device...', 'pending');
        await window.usbipd.attachDevice(busId);
        updateStatus('Device attached successfully', 'success');
        setTimeout(() => refreshDevices(), 1000);
    } catch (error) {
        updateStatus(`Failed to attach device: ${error.message}`, 'error');
    }
}

async function detachDevice(busId) {
    try {
        updateStatus('Detaching device...', 'pending');
        await window.usbipd.detachDevice(busId);
        updateStatus('Device detached successfully', 'success');
        setTimeout(() => refreshDevices(), 1000);
    } catch (error) {
        updateStatus(`Failed to detach device: ${error.message}`, 'error');
    }
}

// Refresh device list
function refreshDevices() {
    updateStatus('Refreshing device list...');
    window.usbipd.listDevices();
}

// Event listeners
refreshBtn.onclick = refreshDevices;

// WebSocket message handling
window.addEventListener('usbipd-message', (event) => {
    const data = event.detail;
    
    if (data.error) {
        updateStatus(data.error, 'error');
        return;
    }
    
    if (data.devices) {
        updateDeviceList(data.devices);
        updateStatus('Device list updated successfully', 'success');
    } else if (data.success) {
        updateStatus('Operation completed successfully', 'success');
    }
});

// Initial connection
(async () => {
    try {
        await window.usbipd.connect();
        updateStatus('Connected to server', 'success');
        refreshDevices();
    } catch (error) {
        updateStatus(`Failed to connect: ${error.message}`, 'error');
    }
})();

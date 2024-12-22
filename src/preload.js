const { contextBridge } = require('electron');
const WebSocket = require('ws');

let ws = null;

const usbipd = {
    connect: () => {
        return new Promise((resolve, reject) => {
            ws = new WebSocket('ws://localhost:8080');
            
            ws.onopen = () => {
                resolve();
            };
            
            ws.onerror = (error) => {
                reject(error);
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                window.dispatchEvent(new CustomEvent('usbipd-message', { detail: data }));
            };
        });
    },
    
    listDevices: () => {
        if (!ws) throw new Error('Not connected');
        ws.send(JSON.stringify({ type: 'list' }));
    },
    
    attachDevice: (busId) => {
        if (!ws) throw new Error('Not connected');
        ws.send(JSON.stringify({ type: 'attach', params: [busId] }));
    },
    
    detachDevice: (busId) => {
        if (!ws) throw new Error('Not connected');
        ws.send(JSON.stringify({ type: 'detach', params: [busId] }));
    }
};

contextBridge.exposeInMainWorld('usbipd', usbipd);

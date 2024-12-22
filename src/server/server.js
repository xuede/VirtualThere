const { spawn } = require('child_process');
const WebSocket = require('ws');
const path = require('path');

const USBIPD_PATH = path.join(__dirname, '..', '..', 'usbipd-win', 'usbipd.exe');

class UsbIpdServer {
    constructor() {
        this.wss = new WebSocket.Server({ port: 8080 });
        this.setupWebSocket();
    }

    setupWebSocket() {
        this.wss.on('connection', (ws) => {
            console.log('Client connected');

            ws.on('message', async (message) => {
                try {
                    const command = JSON.parse(message);
                    const result = await this.handleCommand(command);
                    ws.send(JSON.stringify(result));
                } catch (error) {
                    ws.send(JSON.stringify({ error: error.message }));
                }
            });
        });
    }

    async handleCommand({ type, params = [] }) {
        switch (type) {
            case 'list':
                return this.listDevices();
            case 'attach':
                return this.attachDevice(params[0]);
            case 'detach':
                return this.detachDevice(params[0]);
            default:
                throw new Error(`Unknown command: ${type}`);
        }
    }

    executeCommand(args) {
        return new Promise((resolve, reject) => {
            const process = spawn(USBIPD_PATH, args);
            let output = '';
            let error = '';

            process.stdout.on('data', (data) => {
                output += data.toString();
            });

            process.stderr.on('data', (data) => {
                error += data.toString();
            });

            process.on('close', (code) => {
                if (code === 0) {
                    resolve(output);
                } else {
                    reject(new Error(error || output));
                }
            });
        });
    }

    async listDevices() {
        const output = await this.executeCommand(['list']);
        const devices = [];
        
        // Parse the output and extract device information
        const lines = output.split('\n').slice(1); // Skip header
        for (const line of lines) {
            if (!line.trim()) continue;
            
            const [busId, vid, pid, ...rest] = line.trim().split(/\s+/);
            const name = rest.join(' ');
            
            if (busId && vid && pid) {
                devices.push({
                    busId,
                    vid,
                    pid,
                    name
                });
            }
        }
        
        return { devices };
    }

    async attachDevice(busId) {
        await this.executeCommand(['attach', '--busid', busId]);
        return { success: true };
    }

    async detachDevice(busId) {
        await this.executeCommand(['detach', '--busid', busId]);
        return { success: true };
    }
}

const server = new UsbIpdServer();
console.log('USBIPD GUI Server running on ws://localhost:8080');

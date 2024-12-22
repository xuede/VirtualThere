# USBIPD-WIN GUI

A modern graphical user interface for managing USB/IP devices on Windows using USBIPD-WIN.

## Overview

This application provides a user-friendly interface for the USBIPD-WIN command-line tool, allowing you to:
- View all available USB devices
- Attach devices to remote machines or WSL
- Detach devices with a single click
- Monitor device status in real-time

## Prerequisites

- Windows 10/11
- Node.js LTS version (16.x or later)
- USBIPD-WIN (follow installation steps below)

## Installation

1. Clone this repository:
```bash
git clone [repository-url]
cd usbipd-gui
```

2. Clone USBIPD-WIN:
```bash
git clone https://github.com/dorssel/usbipd-win.git
```

3. Install dependencies:
```bash
npm install
```

## Running the Application

The application consists of two components that need to be running simultaneously:

1. Start the USBIPD server:
```bash
npm run server
```

2. In a new terminal, start the GUI application:
```bash
npm start
```

The GUI will automatically connect to the server and display available USB devices.

## Architecture

### Server Component (`src/server/server.js`)

The server component acts as a bridge between the GUI and USBIPD-WIN CLI:

- WebSocket server running on port 8080
- Executes USBIPD-WIN commands and parses responses
- Provides real-time updates to connected clients
- Handles device listing, attachment, and detachment operations

Supported commands:
- `list`: Get all available USB devices
- `attach`: Attach a device by Bus ID
- `detach`: Detach a device by Bus ID

### Client Component (Electron Application)

#### Main Process (`src/main.js`)
- Creates the application window
- Manages application lifecycle
- Handles IPC security

#### Preload Script (`src/preload.js`)
- Provides secure bridge between renderer and main processes
- Exposes WebSocket functionality to the renderer
- Implements the USBIPD API interface

#### Renderer Process
- `index.html`: Application structure and layout
- `styles.css`: Modern, responsive styling
- `app.js`: UI logic and WebSocket communication

## API Interface

The application exposes the following methods through the `window.usbipd` interface:

```javascript
// Connect to the USBIPD server
await window.usbipd.connect()

// List all available devices
window.usbipd.listDevices()

// Attach a device
window.usbipd.attachDevice(busId)

// Detach a device
window.usbipd.detachDevice(busId)
```

## WebSocket Protocol

The server and client communicate using JSON messages:

### Client to Server:
```javascript
// List devices
{ "type": "list" }

// Attach device
{ "type": "attach", "params": ["1-2"] }

// Detach device
{ "type": "detach", "params": ["1-2"] }
```

### Server to Client:
```javascript
// Device list response
{
  "devices": [
    {
      "busId": "1-2",
      "vid": "0483",
      "pid": "5740",
      "name": "STM32 Device"
    }
  ]
}

// Operation success
{ "success": true }

// Error response
{ "error": "Error message" }
```

## Error Handling

The application implements comprehensive error handling:
- Connection failures
- Command execution errors
- Device operation failures
- Invalid responses

Errors are displayed in the status bar with appropriate styling.

## Development

### Project Structure
```
usbipd-gui/
├── src/
│   ├── main.js           # Electron main process
│   ├── preload.js        # Preload script for IPC
│   ├── server/
│   │   └── server.js     # WebSocket server
│   └── renderer/
│       ├── index.html    # Application HTML
│       ├── styles.css    # Application styling
│       └── app.js        # Renderer process logic
├── package.json
└── README.md
```

### Building

1. Install development dependencies:
```bash
npm install
```

2. Run in development mode:
```bash
npm start
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- USBIPD-WIN project for the underlying USB/IP functionality
- Electron framework for the GUI implementation
- WebSocket protocol for real-time communication

## Troubleshooting

### Common Issues

1. Server Connection Failed
   - Ensure the server is running on port 8080
   - Check for firewall restrictions
   - Verify Node.js installation

2. Device Not Listed
   - Refresh the device list
   - Ensure the device is properly connected
   - Check device drivers

3. Attach/Detach Failed
   - Verify administrator privileges
   - Check device availability
   - Ensure no other process is using the device

### Debug Mode

To enable debug mode:
1. Open DevTools in the Electron app (Ctrl+Shift+I)
2. Check the console for detailed logs
3. Monitor WebSocket communication in the Network tab

## Support

For issues and feature requests, please:
1. Check the troubleshooting guide
2. Search existing issues
3. Create a new issue with:
   - Detailed description
   - Steps to reproduce
   - System information
   - Error messages/logs

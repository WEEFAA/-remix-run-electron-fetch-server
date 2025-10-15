# @remix-run/electron-fetch-server

Remix adapter for Electron's `protocol.handle()` API. This package allows you to run Remix applications inside Electron using custom protocol handlers with the Web Fetch API.

## Installation

```bash
npm install @remix-run/electron-fetch-server
```

## Quick Start

```javascript
// main.js (Electron main process)
const { app, protocol, BrowserWindow } = require("electron");
const { createRequestListener } = require("@remix-run/electron-fetch-server");

app.whenReady().then(async () => {
    // Create and register the protocol handler
    protocol.handle(
        "myapp",
        createRequestListener((request) => {
            // Your handler logic here
            return new Response("Hello from Electron!");
        })
    );

    // Create window and load your app
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
    });

    mainWindow.loadURL("myapp:///");

    if (process.env.NODE_ENV === "development") {
        mainWindow.webContents.openDevTools();
    }
});
```

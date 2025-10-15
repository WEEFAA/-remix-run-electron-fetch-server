// Example: Basic usage with @remix-run/electron-fetch-server
const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const { createRequestListener } = require('@remix-run/electron-fetch-server');

let mainWindow;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load your Remix app
  mainWindow.loadURL('myapp:///');

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(async () => {
  try {
    // Simple handler that returns a basic response
    protocol.handle('myapp', createRequestListener((request) => {
      return new Response(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Basic Electron + Remix</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
              }
              h1 { color: #3178c6; }
              code {
                background: #f4f4f4;
                padding: 2px 6px;
                border-radius: 3px;
              }
            </style>
          </head>
          <body>
            <h1>Hello from Electron + Remix! 🚀</h1>
            <p>Request URL: <code>${request.url}</code></p>
            <p>This is a basic example using <code>createRequestListener</code>.</p>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      });
    }));

    // Create window
    await createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to setup app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


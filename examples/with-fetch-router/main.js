
// Example: Using with @remix-run/fetch-router
import { app, BrowserWindow, protocol } from "electron"
import { createRouter , html, json, route } from '@remix-run/fetch-router';
import { logger } from "@remix-run/fetch-router/logger-middleware"
import { createRequestListener } from '@remix-run/electron-fetch-server';

// Create a simple router
const router = createRouter();

const routes = route({
  home: '/',
  about: '/about',
  api: '/api/data',
});

// Route handlers
const showHome = () => {
  return html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Remix + Electron</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1 { color: #3178c6; }
          a {
            color: #3178c6;
            text-decoration: none;
            margin-right: 20px;
          }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Welcome to Remix + Electron! 🚀</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api/data">API</a>
        </nav>
        <p>This is a Remix app running inside Electron using custom protocol handlers.</p>
      </body>
    </html>
  `);
};

const showAbout = () => {
  return html(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>About - Remix + Electron</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
          }
          h1 { color: #3178c6; }
          a { color: #3178c6; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>About</h1>
        <p><a href="/">← Back to Home</a></p>
        <p>This demonstrates @remix-run/electron-fetch-server with @remix-run/fetch-router.</p>
        <p>Using Electron version: ${process.versions.electron}</p>
        <p>Using Chrome version: ${process.versions.chrome}</p>
      </body>
    </html>
  `);
};

const getApiData = () => {
  return json({
    message: 'Hello from Remix in Electron!',
    versions: process.versions,
    platform: process.platform,
  });
};

// Map routes
router.use(logger())
router.map(routes.home, showHome);
router.map(routes.about, showAbout);
router.map(routes.api, getApiData);

// other routes
// router.map(routes.resource, handlers)

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  mainWindow.loadURL('myapp:///');
}

app.whenReady().then(async () => {
  try {
    // Use createRequestListener with the router
    protocol.handle('myapp', createRequestListener(request => {
      try {
        return router.fetch(request);
      } catch(e) {
        console.error('Router error:', e);
        return new Response("Something went wrong", { status: 500 });
      }
    }));

    createWindow();

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


# Basic Example

This is the simplest example of using `@remix-run/electron-fetch-server`.

## Setup

```bash
npm install
```

## Run

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## What This Example Shows

-   Basic protocol handler registration
-   Loading a Remix server build from a path
-   Providing custom load context to Remix loaders
-   Window creation and loading the custom protocol URL

## File Structure

```
basic/
├── main.js           # Electron main process entry point
├── package.json      # Dependencies and scripts
└── build/           # Your Remix app build (you need to create this)
    └── index.js
```

## Next Steps

1. Build your Remix app and place the output in `build/`
2. Update the build path in `main.js` if needed
3. Customize the load context with your own data
4. Add more windows, menus, or Electron features

## Key Code

```javascript
const { createRequestListener } = require("@remix-run/electron-fetch-server");

protocol.handle(
    "myapp",
    createRequestListener((request) => {
        // Your request handler that returns a Response
        return new Response("Hello from Electron!", {
            status: 200,
            headers: { "Content-Type": "text/plain" },
        });
    })
);
```

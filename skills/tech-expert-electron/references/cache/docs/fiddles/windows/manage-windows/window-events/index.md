# Window events

Window events

# Create and Manage Windows

### The BrowserWindow module in Electron allows you to create a new browser window or manage an existing one.

Each browser window is a separate process, known as the renderer process. This process, like the main process that controls the life cycle of the app, has full access to the Node.js APIs.

Open the full API documentation (opens in new window) in your browser.

## Window events

In this demo, we create a new window and listen for blur event on it. Click the demo button to create a new modal window, and switch focus back to the parent window by clicking on it. You can click the Focus on Demo button to switch focus to the modal window again.
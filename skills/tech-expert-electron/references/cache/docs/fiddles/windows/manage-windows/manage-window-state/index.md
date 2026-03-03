# Manage window state

Manage window state

# Create and Manage Windows

### The BrowserWindow module in Electron allows you to create a new browser window or manage an existing one.

Each browser window is a separate process, known as the renderer process. This process, like the main process that controls the life cycle of the app, has full access to the Node.js APIs.

Open the full API documentation (opens in new window) in your browser.

## Manage window state

In this demo we create a new window and listen for move and resize events on it. Click the demo button, change the new window and see the dimensions and position update here, above.

There are a lot of methods for controlling the state of the window such as the size, location, and focus status as well as events to listen to for window changes. Visit the documentation (opens in new window) for the full list.
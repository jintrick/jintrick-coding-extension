# Frameless window

Frameless window

# Create and Manage Windows

### The BrowserWindow module in Electron allows you to create a new browser window or manage an existing one.

Each browser window is a separate process, known as the renderer process. This process, like the main process that controls the life cycle of the app, has full access to the Node.js APIs.

Open the full API documentation (opens in new window) in your browser.

## Create a frameless window

A frameless window is a window that has no "chrome" , such as toolbars, title bars, status bars, borders, etc. You can make a browser window frameless by setting frame to false when creating the window.

Windows can have a transparent background, too. By setting the transparent option to true, you can also make your frameless window transparent:

```
var win = new BrowserWindow({ transparent: true, frame: false })
```

For more details, see the Window Customization documentation.
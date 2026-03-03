## Create a new window

### Supports: Win, macOS, Linux | Process: Main

The BrowserWindow module gives you the ability to create new windows in your app.

There are a lot of options when creating a new window. A few are in this demo, but visit the documentation(opens in new window)

## ProTip

Use an invisible browser window to run background tasks.

You can set a new browser window to not be shown (be invisible) in order to use that additional renderer process as a kind of new thread in which to run JavaScript in the background of your app. You do this by setting the show property to false when defining the new window.

```
var win = new BrowserWindow({ width: 400, height: 225, show: false })
```
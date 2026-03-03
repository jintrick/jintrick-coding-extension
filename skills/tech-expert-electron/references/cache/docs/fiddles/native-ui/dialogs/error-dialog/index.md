# Error Dialog

Error Dialog

# Use system dialogs

### The dialog module in Electron allows you to use native system dialogs for opening files or directories, saving a file or displaying informational messages.

This is a main process module because this process is more efficient with native utilities and it allows the call to happen without interrupting the visible elements in your page's renderer process.

Open the full API documentation (opens in new window) in your browser.

## Error Dialog

In this demo, the ipc module is used to send a message from the renderer process instructing the main process to launch the error dialog.

You can use an error dialog before the app's ready event, which is useful for showing errors upon startup.

##### Renderer Process

```
const {ipcRenderer} = require('electron') const errorBtn = document.getElementById('error-dialog') errorBtn.addEventListener('click', (event) => { ipcRenderer.send('open-error-dialog') })
```

##### Main Process

```
const {ipcMain, dialog} = require('electron') ipcMain.on('open-error-dialog', (event) => { dialog.showErrorBox('An Error Message', 'Demonstrating an error message.') })
```
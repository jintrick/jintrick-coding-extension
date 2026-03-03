# Save Dialog

Save Dialog

# Use system dialogs

### The dialog module in Electron allows you to use native system dialogs for opening files or directories, saving a file or displaying informational messages.

This is a main process module because this process is more efficient with native utilities and it allows the call to happen without interrupting the visible elements in your page's renderer process.

Open the full API documentation (opens in new window) in your browser.

## Save Dialog

In this demo, the ipc module is used to send a message from the renderer process instructing the main process to launch the save dialog. It returns the path selected by the user which can be relayed back to the renderer process.

##### Renderer Process

```
const {ipcRenderer} = require('electron') const saveBtn = document.getElementById('save-dialog') saveBtn.addEventListener('click', (event) => { ipcRenderer.send('save-dialog') }) ipcRenderer.on('saved-file', (event, path) => { if (!path) path = 'No path' document.getElementById('file-saved').innerHTML = `Path selected: ${path}` })
```

##### Main Process

```
const {ipcMain, dialog} = require('electron') ipcMain.on('save-dialog', (event) => { const options = { title: 'Save an Image', filters: [ { name: 'Images', extensions: ['jpg', 'png', 'gif'] } ] } dialog.showSaveDialog(options, (filename) => { event.sender.send('saved-file', filename) }) })
```
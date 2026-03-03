# Open File or Directory

Open File or Directory

# Use system dialogs

### The dialog module in Electron allows you to use native system dialogs for opening files or directories, saving a file or displaying informational messages.

This is a main process module because this process is more efficient with native utilities and it allows the call to happen without interrupting the visible elements in your page's renderer process.

Open the full API documentation (opens in new window) in your browser.

## Open a File or Directory

In this demo, the ipc module is used to send a message from the renderer process instructing the main process to launch the open file (or directory) dialog. If a file is selected, the main process can send that information back to the renderer process.

##### Renderer Process

```
const {ipcRenderer} = require('electron') const selectDirBtn = document.getElementById('select-directory') selectDirBtn.addEventListener('click', (event) => { ipcRenderer.send('open-file-dialog') }) ipcRenderer.on('selected-directory', (event, path) => { document.getElementById('selected-file').innerHTML = `You selected: ${path}` })
```

##### Main Process

```
const {ipcMain, dialog} = require('electron') ipcMain.on('open-file-dialog', (event) => { dialog.showOpenDialog({ properties: ['openFile', 'openDirectory'] }, (files) => { if (files) { event.sender.send('selected-directory', files) } }) })
```

## ProTip

The sheet-style dialog on macOS.

On macOS you can choose between a "sheet" dialog or a default dialog. The sheet version descends from the top of the window. To use sheet version, pass the window as the first argument in the dialog method.

```
const ipc = require('electron').ipcMain const dialog = require('electron').dialog const BrowserWindow = require('electron').BrowserWindow ipc.on('open-file-dialog-sheet', function (event) { const window = BrowserWindow.fromWebContents(event.sender) const files = dialog.showOpenDialog(window, { properties: [ 'openFile' ]}) })
```
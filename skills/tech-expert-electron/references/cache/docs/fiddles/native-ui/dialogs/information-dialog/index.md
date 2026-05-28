# Information Dialog

Information Dialog

# Use system dialogs

### The dialog module in Electron allows you to use native system dialogs for opening files or directories, saving a file or displaying informational messages.

This is a main process module because this process is more efficient with native utilities and it allows the call to happen without interrupting the visible elements in your page's renderer process.

Open the full API documentation (opens in new window) in your browser.

## Information Dialog

In this demo, the ipc module is used to send a message from the renderer process instructing the main process to launch the information dialog. Options may be provided for responses which can then be relayed back to the renderer process.

Note: The title property is not displayed in macOS.

An information dialog can contain an icon, your choice of buttons, title and message.

##### Renderer Process

```
const {ipcRenderer} = require('electron') const informationBtn = document.getElementById('information-dialog') informationBtn.addEventListener('click', (event) => { ipcRenderer.send('open-information-dialog') }) ipcRenderer.on('information-dialog-selection', (event, index) => { let message = 'You selected ' if (index === 0) message += 'yes.' else message += 'no.' document.getElementById('info-selection').innerHTML = message })
```

##### Main Process

```
const {ipcMain, dialog} = require('electron') ipcMain.on('open-information-dialog', (event) => { const options = { type: 'info', title: 'Information', message: "This is an information dialog. Isn't it nice?", buttons: ['Yes', 'No'] } dialog.showMessageBox(options, (index) => { event.sender.send('information-dialog-selection', index) }) })
```
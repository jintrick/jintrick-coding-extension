# Drag and drop files

Drag and drop files

# Drag and drop files

Supports: Win, macOS, Linux | Process: Both

### Electron supports dragging files and content out from web content into the operating system's world.

Open the full API documentation (opens in new window) in your browser.

## Dragging files

Drag Demo

Click and drag the link above to copy the renderer process javascript file on to your machine.

In this demo, the webContents.startDrag() API is called in response to the ondragstart event.

##### Renderer Process

```
const {ipcRenderer} = require('electron') const dragFileLink = document.getElementById('drag-file-link') dragFileLink.addEventListener('dragstart', (event) => { event.preventDefault() ipcRenderer.send('ondragstart', __filename) })
```

##### Main Process

```
const {ipcMain} = require('electron') const path = require('path') ipcMain.on('ondragstart', (event, filepath) => { const iconName = 'codeIcon.png' event.sender.startDrag({ file: filepath, icon: path.join(__dirname, iconName) }) })
```
# Open external links and the file manager

Open external links and the file manager

# Open external links and the file manager

### The shell module in Electron allows you to access certain native elements like the file manager and default web browser.

This module works in both the main and renderer process.

Open the full API documentation (opens in new window) in your browser.

## Open Path in File Manager

This demonstrates using the shell module to open the system file manager at a particular location.

Clicking the demo button will open your file manager at the root.

## Open External Links

If you do not want your app to open website links within the app, you can use the shell module to open them externally. When clicked, the links will open outside of your app and in the user's default web browser.

When the demo button is clicked, the electron website will open in your browser.

## ProTip

Open all outbound links externally.

You may want to open all http and https links outside of your app. To do this, query the document and loop through each link and add a listener. This app uses the code below which is located in assets/ex-links.js.

##### Renderer Process

```
const shell = require('electron').shell const links = document.querySelectorAll('a[href]') for (const link of links) { const url = link.getAttribute('href') if (url.indexOf('http') === 0) { link.addEventListener('click', (e) => { e.preventDefault() shell.openExternal(url) }) } }
```
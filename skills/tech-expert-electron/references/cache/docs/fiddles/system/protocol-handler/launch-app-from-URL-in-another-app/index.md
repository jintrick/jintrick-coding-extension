# app.setAsDefaultProtocol Demo

app.setAsDefaultProtocol Demo

# App Default Protocol Demo

The protocol API allows us to register a custom protocol and intercept existing protocol requests.

These methods allow you to set and unset the protocols your app should be the default app for. Similar to when a browser asks to be your default for viewing web pages.

Open the full protocol API documentation in your browser.

-----

### Demo

First: Launch current page in browser

Then: Launch the app from a web link! Click here to launch the app

----

You can set your app as the default app to open for a specific protocol. For instance, in this demo we set this app as the default for electron-fiddle://. The demo button above will launch a page in your default browser with a link. Click that link and it will re-launch this app.

### Packaging

This feature will only work on macOS when your app is packaged. It will not work when you're launching it in development from the command-line. When you package your app you'll need to make sure the macOS plist for the app is updated to include the new protocol handler. If you're using @electron/packager then you can add the flag --extend-info with a path to the plist you've created. The one for this app is below:

##### macOS plist

```
<?xml version="1.0" encoding="UTF-8"?> <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"> <plist version="1.0"> <dict> <key>CFBundleURLTypes</key> <array> <dict> <key>CFBundleURLSchemes</key> <array> <string>electron-api-demos</string> </array> <key>CFBundleURLName</key> <string>Electron API Demos Protocol</string> </dict> </array> <key>ElectronTeamID</key> <string>VEKTX9H2N7</string> </dict> </plist>
```
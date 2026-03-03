# Keyboard Shortcuts

Keyboard Shortcuts

# Keyboard Shortcuts

### The globalShortcut and Menu modules can be used to define keyboard shortcuts.

In Electron, keyboard shortcuts are called accelerators. They can be assigned to actions in your application's Menu, or they can be assigned globally so they'll be triggered even when your app doesn't have keyboard focus.

Open the full documentation for the Menu, Accelerator, and globalShortcut APIs in your browser.

To try this demo, press CommandOrControl+Alt+K on your keyboard.

Global shortcuts are detected even when the app doesn't have keyboard focus, and they must be registered after the app's `ready` event is emitted.

## ProTip

Avoid overriding system-wide keyboard shortcuts.

When registering global shortcuts, it's important to be aware of existing defaults in the target operating system, so as not to override any existing behaviors. For an overview of each operating system's keyboard shortcuts, view these documents:

* macOS
* Windows
* Linux
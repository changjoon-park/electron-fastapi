const { app, BrowserWindow } = require("electron");
const path = require("node:path");

// Set NODE_ENV to 'production' if not already set
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}

const PythonSubprocessManager = require("./python_subprocess_manager");
const waitForServerReady = require("./server_check");
const { logInfo, logError } = require("./logger");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const pythonManager = new PythonSubprocessManager();

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("frontend/index.html");

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  pythonManager.start();

  waitForServerReady("127.0.0.1", 4040, "/", 100, 30)
    .then(() => {
      logInfo("Server is ready (port 4040). Launching the Electron window...");
      createWindow();
    })
    .catch((error) => {
      logError("Failed to wait for server to be ready:", error);
      app.quit();
    });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// This is called when all windows are closed and should handle app exit for non-macOS platforms.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit(); // This triggers 'before-quit'
  }
});

// Ensures all subprocesses are terminated before the app completely quits.
app.on("before-quit", () => {
  pythonManager.stop(); // Clean up Python subprocesses.
});

// Clean up Python subprocesses before quitting the app.
app.on("quit", () => {
  pythonManager.stop();
  logInfo("Application is quitting. Goodbye!");
});

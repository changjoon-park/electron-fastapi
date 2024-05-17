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

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  process.on("exit", () => {
    pythonManager.stop();
  });

  if (process.platform !== "darwin") {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

process.on("exit", () => {
  pythonManager.stop();
});

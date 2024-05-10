"use strict";

const { app, BrowserWindow } = require("electron");
const PythonSubprocessManager = require("./python_subprocess_manager");
const waitForServerReady = require("./server_check");
const { logInfo, logError } = require("./logger");

let mainWindow;

// Initialize the Python subprocess manager
const pythonManager = new PythonSubprocessManager();

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("frontend/index.html");

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  pythonManager.start();

  // Wait for the FastAPI server to become ready
  waitForServerReady("127.0.0.1", 4040, "/", 100, 30)
    .then(() => {
      logInfo("Server is ready (port 4040). Launching the Electron window...");
      createMainWindow();
    })
    .catch((error) => {
      logError("Failed to wait for server to be ready:", error);
      app.quit();
    });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    pythonManager.stop();
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

process.on("exit", () => {
  pythonManager.stop();
});

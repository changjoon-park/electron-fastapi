const { spawn, execFile } = require("child_process");
const path = require("path");
const psTree = require("ps-tree");
const { app } = require("electron");
const { logInfo, logError } = require("./logger");

class PythonSubprocessManager {
  constructor() {
    this.subProcess = null;
    this.PY_SRC_FOLDER = "backend"; // Directory where your Python source code is located
    this.PY_DIST_FOLDER = "out-python"; // Directory where PyInstaller outputs the executable
    this.PY_MODULE = "run_app"; // The name of your main Python module (or executable name)
  }

  getPythonScriptPath() {
    const isProduction = process.env.NODE_ENV === "production";
    const baseDir = isProduction
      ? path.dirname(app.getPath("exe")) // Path for production
      : app.getAppPath(); // Path for development

    let executablePath;
    if (process.platform === "win32") {
      executablePath = path.join(baseDir, "run_app.exe"); // TODO: Check Windows executable
    } else if (process.platform === "darwin") {
      executablePath = path.join(baseDir, "..", "Resources", "run_app.app"); // macOS executable path
    } else {
      executablePath = path.join(baseDir, "run_app"); // Fallback for other platforms
    }

    const srcPath = path.join(baseDir, "backend", "run_app.py"); // Path for development
    return isProduction ? executablePath : srcPath;
  }

  start() {
    const scriptPath = this.getPythonScriptPath();
    const isProduction = process.env.NODE_ENV === "production";
    const pythonCommand = isProduction ? scriptPath : "python";
    const args = isProduction ? [] : [scriptPath];

    logInfo(`Starting Python subprocess. Environment: ${process.env.NODE_ENV}`);
    logInfo(`Script path: ${scriptPath}`);
    logInfo(`Python command: ${pythonCommand}`);

    if (!isProduction) {
      execFile(pythonCommand, ["--version"], (error, stdout) => {
        if (error) {
          logError("Python is not installed or not found in PATH:", error);
          return;
        }
        logInfo(`Python version: ${stdout.trim()}`);
      });
    }

    try {
      logInfo("Starting Python subprocess...");
      this.subProcess = isProduction
        ? execFile(pythonCommand, args)
        : spawn(pythonCommand, args);
    } catch (error) {
      logError(`Error starting Python subprocess: ${error}`);
    }

    logInfo(`Python subprocess started with script: ${scriptPath}`);

    this.subProcess.stdout.on("data", (data) => {
      logInfo(`Python subprocess stdout: ${data}`);
    });

    this.subProcess.stderr.on("data", (data) => {
      logError(`Python subprocess stderr: ${data}`);
    });

    this.subProcess.on("close", (code) => {
      logInfo(`Python subprocess exited with code ${code}`);
      this.subProcess = null;
    });
  }

  stop() {
    if (this.subProcess) {
      const pid = this.subProcess.pid;
      psTree(pid, (err, children) => {
        [pid].concat(children.map((p) => p.PID)).forEach((tpid) => {
          try {
            process.kill(tpid, "SIGTERM");
          } catch (error) {
            logError(`Failed to kill process ${tpid}:`, error);
          }
        });
        this.subProcess = null;
        logInfo("Python subprocess and its children have been stopped.");
      });
    }
  }
}

module.exports = PythonSubprocessManager;

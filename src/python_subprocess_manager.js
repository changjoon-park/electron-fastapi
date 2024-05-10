// src/main/python_subprocess_manager.js
const { spawn, execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const psTree = require("ps-tree");
const { logInfo, logError } = require("./logger");

class PythonSubprocessManager {
  constructor() {
    this.subProcess = null;
    this.PY_DIST_FOLDER = "dist-python";
    this.PY_SRC_FOLDER = "backend";
    this.PY_MODULE = "run_app.py";
  }

  isRunningInBundle() {
    return fs.existsSync(path.join(__dirname, `../${this.PY_DIST_FOLDER}`));
  }

  getPythonScriptPath() {
    if (!this.isRunningInBundle()) {
      return path.join(__dirname, `../${this.PY_SRC_FOLDER}`, this.PY_MODULE);
    } else if (process.platform === "win32") {
      return path.join(
        __dirname,
        `../${this.PY_DIST_FOLDER}`,
        this.PY_MODULE.slice(0, -3) + ".exe"
      );
    } else {
      return path.join(__dirname, `../${this.PY_DIST_FOLDER}`, this.PY_MODULE);
    }
  }

  start() {
    const scriptPath = this.getPythonScriptPath();
    const pythonCommand = this.isRunningInBundle() ? scriptPath : "python";
    const args = this.isRunningInBundle() ? [] : [scriptPath];

    // Check Python version for diagnostics
    execFile(pythonCommand, ["--version"], (error, stdout) => {
      if (error) {
        logError("Python is not installed or not found in PATH:", error);
        return;
      }
      logInfo(`Python version: ${stdout.trim()}`);
    });

    // Start the Python subprocess
    this.subProcess = this.isRunningInBundle()
      ? execFile(scriptPath, args)
      : spawn(pythonCommand, args);
    logInfo("Python subprocess started with script:", scriptPath);

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
        console.log("Python subprocess and its children have been stopped.");
      });
    }
  }
}

module.exports = PythonSubprocessManager;

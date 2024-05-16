const { spawn, execFile } = require("child_process");
const path = require("path");
const psTree = require("ps-tree");
const { logInfo, logError } = require("./logger");

class PythonSubprocessManager {
  constructor() {
    this.subProcess = null;
    this.PY_DIST_FOLDER = "out-python";
    this.PY_SRC_FOLDER = "backend";
    this.PY_MODULE = "run_app.py";
  }

  getPythonScriptPath() {
    const isProduction = process.env.NODE_ENV === "production";
    const distPath = path.join(
      __dirname,
      `../${this.PY_DIST_FOLDER}`,
      this.PY_MODULE.slice(0, -3) + (process.platform === "win32" ? ".exe" : "")
    );
    const srcPath = path.join(
      __dirname,
      `../${this.PY_SRC_FOLDER}`,
      this.PY_MODULE
    );
    return isProduction ? distPath : srcPath;
  }

  start() {
    const scriptPath = this.getPythonScriptPath();
    const pythonCommand =
      process.env.NODE_ENV === "production" ? scriptPath : "python";
    const args = process.env.NODE_ENV === "production" ? [] : [scriptPath];

    // Log paths for debugging
    logInfo(`Starting Python subprocess. Environment: ${process.env.NODE_ENV}`);
    logInfo(`Script path: ${scriptPath}`);
    logInfo(`Python command: ${pythonCommand}`);

    // Check Python version for diagnostics
    execFile(pythonCommand, ["--version"], (error, stdout) => {
      if (error) {
        logError("Python is not installed or not found in PATH:", error);
        return;
      }
      logInfo(`Python version: ${stdout.trim()}`);
    });

    // Start the Python subprocess
    this.subProcess =
      process.env.NODE_ENV === "production"
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
        logInfo("Python subprocess and its children have been stopped.");
      });
    }
  }
}

module.exports = PythonSubprocessManager;

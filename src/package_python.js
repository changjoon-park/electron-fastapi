const { spawn } = require("child_process");
const path = require("path");
const { logInfo, logError } = require("./logger");

// Function to build the Python application using PyInstaller
function buildPythonApp() {
  const pyInstallerArgs = [
    "-w",
    "--distpath dist-python",
    "backend/run_app.py",
  ];

  const pyInstaller = spawn("pyinstaller", pyInstallerArgs, {
    shell: true,
    stdio: "inherit", // This will inherit stdio from parent, useful for direct console output
  });

  pyInstaller.on("error", (err) => {
    logError(`Failed to start PyInstaller process: ${err}`);
  });

  pyInstaller.on("close", (code) => {
    if (code === 0) {
      logInfo("PyInstaller completed successfully.");
    } else {
      logError(`PyInstaller exited with code ${code}.`);
    }
  });
}

// Run the build function
buildPythonApp();

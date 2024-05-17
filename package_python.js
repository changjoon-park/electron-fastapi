const { spawn } = require("child_process");

// Function to build the Python application using PyInstaller
function buildPythonApp() {
  const pyInstallerArgs = ["-w", "--distpath out-python", "backend/run_app.py"];

  const pyInstaller = spawn("pyinstaller", pyInstallerArgs, {
    shell: true,
    stdio: "inherit", // This will inherit stdio from parent, useful for direct console output
  });

  pyInstaller.on("error", (err) => {
    console.log(`Failed to start PyInstaller process: ${err}`);
  });

  pyInstaller.on("close", (code) => {
    if (code === 0) {
      console.log("PyInstaller completed successfully.");
    } else {
      console.log(`PyInstaller exited with code ${code}.`);
    }
  });
}

// Run the build function
buildPythonApp();

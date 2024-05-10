// src/main/server_check.js
const http = require("http");
const { logInfo, logError } = require("./logger");

function waitForServerReady(host, port, path = "/", timeout = 100, retries = 30) {
    return new Promise((resolve, reject) => {
        const attemptConnection = (retryCount) => {
            const url = `http://${host}:${port}${path}`;
            logInfo(`Attempting to connect to ${url}. Retries left: ${retryCount}`);

            http.get(url, (res) => {
                if (res.statusCode === 200) {
                    resolve(res.statusCode);
                } else {
                    logError(`Server not ready. Status code: ${res.statusCode}. Retrying...`);
                    retry(retryCount);
                }
            }).on("error", (err) => {
                logError(`Server not ready. Error: ${err.message}. Retrying...`);
                retry(retryCount);
            });
        };

        const retry = (retryCount) => {
            if (retryCount > 0) {
                setTimeout(() => attemptConnection(retryCount - 1), timeout);
            } else {
                reject(new Error("Server did not become ready in time."));
            }
        };

        attemptConnection(retries);
    });
}

module.exports = waitForServerReady;

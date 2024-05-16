const { app } = require("electron");
const { createLogger, format, transports } = require("winston");
const path = require("path");

// Use the documents directory for logs
const logDirectory = app.getPath("documents");
const logFilePath = path.join(logDirectory, "app.log");

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: logFilePath }),
  ],
});

function logInfo(message) {
  logger.info(message);
}

function logError(message) {
  logger.error(message);
}

module.exports = { logInfo, logError };

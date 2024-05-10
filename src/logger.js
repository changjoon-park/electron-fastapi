function logInfo(message) {
  console.log(`[INFO]: ${message}`);
}
  
function logError(message) {
  console.error(`[ERROR]: ${message}`);
}
  
module.exports = { logInfo, logError };

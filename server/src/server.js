const { createServer } = require("./app");
const { PORT } = require("./config/constants");
const logger = require("./utils/loggers");

const server = createServer();

server.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`);
});

server.on("error", (err) => {
  logger.critical("Server failed to start", { code: err.code, message: err.message });
  process.exit(1);
});

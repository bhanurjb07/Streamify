const { createServer } = require("./app");
const { PORT } = require("./config/constants");

const server = createServer();

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

const COLORS = {
  reset: "\x1b[0m",
  info: "\x1b[36m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
  success: "\x1b[32m",
  critical: "\x1b[35m",
};

const timeStamp = () => new Date().toISOString();

const messageFormat = (level, message, meta) => {
  const color = COLORS[level] || COLORS.reset;
  const metaText = meta ? ` ${JSON.stringify(meta)}` : "";
  return `${color}[${timeStamp()}] [${level.toUpperCase()}] ${message}${metaText}${COLORS.reset}`;
};

const logger = {
  info(message, meta) {
    console.log(messageFormat("info", message, meta));
  },
  warn(message, meta) {
    console.log(messageFormat("warn", message, meta));
  },
  error(message, meta) {
    console.log(messageFormat("error", message, meta));
  },
  success(message, meta) {
    console.log(messageFormat("success", message, meta));
  },
  critical(message, meta) {
    console.log(messageFormat("critical", message, meta));
  },
};

module.exports = logger;

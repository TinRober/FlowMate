/**
 * Logger com Winston + Rotação de Logs
 * - Cria diretório "logs" se não existir.
 * - Rotaciona arquivos diariamente.
 * - Mantém histórico limitado.
 * - Suporte para níveis dinâmicos e logs estruturados.
 */

const fs = require("fs");
const path = require("path");
const winston = require("winston");
require("winston-daily-rotate-file");

const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Nível dinâmico 
const logLevel = process.env.LOG_LEVEL || "info";

// Transport para rotação diária
const rotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "10m",
  maxFiles: "7d"
});

// Transport separado para erros
const errorRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "5m",
  maxFiles: "14d",
  level: "error"
});

// Logger principal
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    rotateTransport,
    errorRotateTransport
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, "exceptions.log") })
  ]
});

/**
 * Função para registrar mensagens detalhadas (entrada/saída).
 * @param {string} type - Tipo da mensagem: RECEIVED ou SENT
 * @param {string} number - Número do contato
 * @param {string} text - Texto da mensagem
 * @param {string} clienteId - ID do cliente (opcional)
 */
function logMessage(type, number, text, clienteId = "") {
  const prefix = clienteId ? `[${clienteId}]` : "";
  logger.info(`${prefix} ${type} | ${number} | ${text}`);
}

module.exports = { logger, logMessage };
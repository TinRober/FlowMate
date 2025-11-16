/**
 * Gerencia histórico de conversas por sessão.
 * - Salva mensagens em arquivos JSON.
 * - Mantém apenas as últimas N mensagens (default: 10).
 */
const fs = require("fs").promises;
const path = require("path");
const { logger } = require("./logger");

const historyDir = path.join(process.cwd(), "bot", "instances", "history");
const MAX_MESSAGES = 10;

// Garante que o diretório de histórico exista
async function ensureHistoryDir() {
  try {
    await fs.mkdir(historyDir, { recursive: true });
  } catch (err) {
    logger.error(`Erro ao criar diretório de histórico: ${err.message}`);
  }
}

// Caminho do arquivo de histórico por sessão
function getHistoryFile(sessionId) {
  return path.join(historyDir, `${sessionId}.json`);
}

// Adiciona mensagem ao histórico
async function addMessage(sessionId, role, content) {
  await ensureHistoryDir();
  const file = getHistoryFile(sessionId);
  let data = [];

  try {
    const exists = await fs.stat(file).catch(() => null);
    if (exists) {
      const raw = await fs.readFile(file, "utf-8");
      data = JSON.parse(raw);
    }
  } catch (err) {
    logger.warn(`Histórico corrompido ou inexistente para ${sessionId}: ${err.message}`);
  }

  data.push({ role, content, timestamp: new Date().toISOString() });
  if (data.length > MAX_MESSAGES) data.shift();

  try {
    await fs.writeFile(file, JSON.stringify(data, null, 2));
  } catch (err) {
    logger.error(`Erro ao salvar histórico para ${sessionId}: ${err.message}`);
  }
}

// Recupera histórico de mensagens
async function getHistory(sessionId) {
  const file = getHistoryFile(sessionId);
  try {
    const exists = await fs.stat(file).catch(() => null);
    if (!exists) return [];
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    logger.warn(`Erro ao ler histórico para ${sessionId}: ${err.message}`);
    return [];
  }
}

module.exports = { addMessage, getHistory };

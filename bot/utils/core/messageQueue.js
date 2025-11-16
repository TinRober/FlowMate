/**
 * Gerencia filas de mensagens por cliente com delay.
 * - Cada cliente tem sua própria fila.
 * - Evita bloqueio do event loop.
 * - Inclui logs e tratamento de erros.
 */

const { logger } = require("./logger");

const queues = new Map(); // Map<clienteId, { queue: [], isProcessing: boolean }>

function addToQueue(client, to, message, delay = 2000) {
  const clienteId = client?.options?.authStrategy?.clientId || "default";

  if (!queues.has(clienteId)) {
    queues.set(clienteId, { queue: [], isProcessing: false });
  }

  const queueObj = queues.get(clienteId);
  queueObj.queue.push({ client, to, message, delay });
  processQueue(clienteId);
}

async function processQueue(clienteId) {
  const queueObj = queues.get(clienteId);
  if (!queueObj || queueObj.isProcessing || queueObj.queue.length === 0) return;

  queueObj.isProcessing = true;
  const { client, to, message, delay } = queueObj.queue.shift();

  try {
    await new Promise(resolve => setTimeout(resolve, delay));
    await client.sendMessage(to, message);
    logger.info(`[${clienteId}] Mensagem enviada para ${to}: ${message}`);
  } catch (err) {
    logger.error(`[${clienteId}] Erro ao enviar mensagem para ${to}: ${err.message}`);
  } finally {
    queueObj.isProcessing = false;
    processQueue(clienteId);
  }
}

function getQueueStatus(clienteId) {
  const queueObj = queues.get(clienteId);
  return queueObj ? { size: queueObj.queue.length, isProcessing: queueObj.isProcessing } : null;
}

function clearQueue(clienteId) {
  if (queues.has(clienteId)) {
    queues.get(clienteId).queue = [];
    logger.warn(`[${clienteId}] Fila limpa.`);
  }
}

module.exports = { addToQueue, getQueueStatus, clearQueue };
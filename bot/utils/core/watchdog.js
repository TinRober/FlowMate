/**
 * Watchdog para monitorar travamentos do cliente WhatsApp.
 * - Reinicia cliente se não houver ping por mais de timeoutMs.
 * - Marca ping automaticamente ao receber mensagens ou eventos.
 */

const { logger } = require("./logger");

/**
 * Atualiza o timestamp do último ping do cliente
 * @param {object} client - Instância do cliente WhatsApp
 */
function marcarPing(client) {
  if (!client.estado) client.estado = {};
  client.estado.ultimoPing = Date.now();
  logger.debug(`[${client.options?.authStrategy?.clientId}] Ping atualizado: ${client.estado.ultimoPing}`);
}

/**
 * Inicia o watchdog para um cliente
 * @param {object} client - Instância do cliente WhatsApp
 * @param {string} clienteId - ID do cliente
 * @param {function} reiniciarFn - Função para reiniciar o cliente
 * @param {number} intervaloMs - Intervalo de checagem (default 30s)
 * @param {number} timeoutMs - Tempo sem ping antes de reiniciar (default 5min)
 * @returns {NodeJS.Timer} - Intervalo do watchdog, pode ser limpo com clearInterval
 */
function iniciarWatchdog(client, clienteId, reiniciarFn, intervaloMs = 30_000, timeoutMs = 5 * 60_000) {
  if (!client || !clienteId || typeof reiniciarFn !== "function") {
    logger.error("Parâmetros inválidos para iniciarWatchdog");
    return;
  }

  // Evita múltiplos watchdogs para o mesmo cliente
  if (client.estado?.watchdogInterval) {
    clearInterval(client.estado.watchdogInterval);
  }

  // Inicializa último ping
  marcarPing(client);

  logger.info(`[${clienteId}] Watchdog iniciado (intervalo: ${intervaloMs}ms, timeout: ${timeoutMs}ms)`);

  const watchdog = setInterval(async () => {
    try {
      const agora = Date.now();
      const ultimoPing = client.estado?.ultimoPing || 0;
      const diff = agora - ultimoPing;

      logger.debug(`[${clienteId}] Último ping há ${diff}ms`);

      if (diff > timeoutMs) {
        logger.error(`[${clienteId}] WATCHDOG: Sem ping há ${diff}ms. Reiniciando cliente...`);
        clearInterval(watchdog);

        try {
          await client.destroy();
          logger.info(`[${clienteId}] Cliente destruído.`);
        } catch (err) {
          logger.error(`[${clienteId}] Erro ao destruir cliente: ${err.message}`);
        }

        reiniciarFn(); // tenta reiniciar de qualquer forma
      }
    } catch (err) {
      logger.error(`[${clienteId}] Erro no watchdog: ${err.message}`);
    }
  }, intervaloMs);

  // Salva referência do interval no client para evitar duplicidade
  client.estado.watchdogInterval = watchdog;

  return watchdog;
}

module.exports = { iniciarWatchdog, marcarPing };

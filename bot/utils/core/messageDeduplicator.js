/**
 * Deduplicador de mensagens para evitar respostas duplicadas.
 * - Armazena IDs de mensagens já processadas por cliente.
 * - Limpa IDs antigos para evitar crescimento infinito.
 */

const MAX_IDS = 1000; // Limite de IDs armazenados por cliente
const dedupMap = new Map(); 

function processarMensagemId(client, msg) {
  const clienteId = client?.options?.authStrategy?.clientId || "default";
  const messageId = msg.id._serialized;

  if (!dedupMap.has(clienteId)) {
    dedupMap.set(clienteId, new Set());
  }

  const idsSet = dedupMap.get(clienteId);

  if (idsSet.has(messageId)) {
    return true; 
  }

  idsSet.add(messageId);

  // Limita tamanho do Set
  if (idsSet.size > MAX_IDS) {
    const arr = Array.from(idsSet);
    idsSet.clear();
    arr.slice(-MAX_IDS).forEach(id => idsSet.add(id));
  }

  return false; 
}

module.exports = { processarMensagemId };
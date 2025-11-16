/**
 * Gerencia sessões para evitar spam (anti-flood).
 * - Mantém intervalo mínimo entre respostas para cada número.
 */

const sessions = new Map();
const TEMPO_PAUSA = 3000; // 3 segundos entre respostas

/** Verifica se pode responder para um número (anti-flood).
 * @param {string} numero
   @returns {boolean}
  */
 
function podeResponder(numero) {
  const agora = Date.now();
  const ultimaMensagem = sessions.get(numero);
  return !ultimaMensagem || (agora - ultimaMensagem > TEMPO_PAUSA);
}

/**
 * Registra a última mensagem recebida para controle anti-flood.
 * @param {string} numero
 */
function registrarMensagem(numero) {
  sessions.set(numero, Date.now());
}

module.exports = {
  podeResponder,
  registrarMensagem
};
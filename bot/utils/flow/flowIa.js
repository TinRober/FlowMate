/**
 * Wrapper seguro para o fluxo IA.
 * - Reusa a implementação existente em utils/mensagens/fluxoMensagem.js quando disponível.
 * - Exporta uma função chamada `processarMensagemIA` que o flowRouter pode chamar sem risco.
 *
 * Objetivo: NÃO sobrescrever nem quebrar código existente. Apenas adaptar.
 */

const { logger } = require("../core/logger");

let impl = null;

// Tenta carregar a implementação existente do fluxo IA (fluxoMensagem.js)
try {
  const fluxoMensagem = require("../mensagens/fluxoMensagem");

  // Prioridade: usar a função que já existia no projeto
  impl =
    fluxoMensagem.processarMensagem ||
    fluxoMensagem.processarFluxoIA ||
    fluxoMensagem.processarMensagemIA ||
    null;

  if (!impl) {
    logger.warn(
      "[flowIA] módulo utils/mensagens/fluxoMensagem carregado, mas nenhuma função conhecida encontrada."
    );
  } else {
    logger.info("[flowIA] usando implementação existente de utils/mensagens/fluxoMensagem.");
  }
} catch (err) {
  logger.warn(`[flowIA] não foi possível carregar utils/mensagens/fluxoMensagem: ${err.message}`);
  impl = null;
}

//Fallback leve — usado caso não exista implementação válida.
async function fallbackProcessarMensagem(msg, client, contextoIA, atendimentoTemp, marcarAtendimento, boasVindas) {
  try {
    // Dispara boas-vindas apenas na primeira mensagem do contato
    const numero = msg.from;
    client.firstMessageSent = client.firstMessageSent || {};
    if (!client.firstMessageSent[numero]) {
      client.firstMessageSent[numero] = true;
      await client.sendMessage(numero, boasVindas || "Olá! Em que posso ajudar?");
      return;
    }

    // Mensagem padrão caso IA esteja indisponível
    const reply = "Desculpe — o serviço de IA não está disponível no momento. Tente novamente mais tarde.";
    await client.sendMessage(msg.from, reply);

  } catch (err) {
    logger.error(`[flowIA][fallback] erro ao processar mensagem IA: ${err.message}`);
  }
}

async function processarMensagemIA(msg, client, contextoIA, atendimentoTemp, marcarAtendimento, boasVindas) {
  try {
    if (impl) {
      // Chama a implementação real passando boasVindas
      return await impl(msg, client, contextoIA, atendimentoTemp, marcarAtendimento, boasVindas);
    }

    // fallback seguro
    return await fallbackProcessarMensagem(msg, client, contextoIA, atendimentoTemp, marcarAtendimento, boasVindas);

  } catch (err) {
    logger.error(`[flowIA] erro ao executar impl do fluxo IA: ${err.message}`);
    try {
      return await fallbackProcessarMensagem(msg, client, contextoIA, atendimentoTemp, marcarAtendimento, boasVindas);
    } catch (err2) {
      logger.error(`[flowIA] erro no fallback após falha da impl: ${err2.message}`);
    }
  }
}

module.exports = { processarMensagemIA };

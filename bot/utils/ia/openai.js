// utils/openai.js
const { OpenAI } = require("openai");
const dotenv = require("dotenv");
const { getHistory, addMessage } = require("../core/history");
const { logger } = require("../core/logger");
const { gerarPrompt } = require("./promptGenerator");

dotenv.config();

const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MAX_MESSAGE_LENGTH = 2000; // Limite de caracteres da mensagem

/**
 * Responde usando IA, respeitando o contexto do cliente
 * @param {string} clienteId - ID do cliente
 * @param {string} mensagem - Mensagem enviada pelo usuário
 * @param {object} contextoIA - Contexto específico do cliente
 * @returns {Promise<string>} Resposta da IA
 */
async function responderComIA(clienteId, mensagem, contextoIA) {
  const startTime = Date.now();

  if (!process.env.OPENAI_API_KEY) {
    logger.error(`[${clienteId}] OPENAI_API_KEY não configurada.`);
    return "⚠️ IA não está configurada.";
  }

  try {
    // Tratar mensagens muito longas
    if (mensagem.length > MAX_MESSAGE_LENGTH) {
      logger.warn(`[${clienteId}] Mensagem muito longa (${mensagem.length} caracteres). Será truncada.`);
      mensagem = mensagem.slice(0, MAX_MESSAGE_LENGTH) + "... [mensagem truncada]";
    }

    logger.info(`[${clienteId}] Mensagem recebida: ${mensagem}`);

    // Gera prompt usando contexto do cliente
    const prompt = gerarPrompt(clienteId, contextoIA, mensagem);

    // Recupera histórico do cliente
    const history = await getHistory(clienteId);
    logger.info(`[${clienteId}] Histórico atual (${history.length} mensagens)`);

    const messages = [
      { role: "system", content: prompt },
      ...history,
      { role: "user", content: mensagem }
    ];

    // Chamada à API OpenAI
    const response = await openaiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages,
      temperature: 0.7
    });

    const resposta = response.choices[0].message.content.trim();

    // Atualiza histórico
    await addMessage(clienteId, "user", mensagem);
    await addMessage(clienteId, "assistant", resposta);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logger.info(`[${clienteId}] IA respondeu em ${duration}s: ${resposta}`);

    return resposta;

  } catch (error) {
    logger.error(`[${clienteId}] Erro ao gerar resposta com IA: ${error.message}`);
    return "Desculpe, ocorreu um erro ao processar sua mensagem.";
  }
}

module.exports = { responderComIA };

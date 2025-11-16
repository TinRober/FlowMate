const { responderComIA } = require("./openai");
const { logger } = require("../core/logger");


async function processarIA(clienteId, texto, contextoIA, client, contato, marcarAtendimento) {
    logger.info(`[${clienteId}] Chamando IA para: ${texto}`);
    const respostaIA = await responderComIA(clienteId, texto, contextoIA);
    logger.info(`[${clienteId}] IA respondeu: ${respostaIA}`);

    if (!respostaIA || respostaIA.trim() === "") {
        await client.sendMessage(contato, "Desculpe, não consegui entender. Pode reformular?");
        return;
    }

    if (respostaIA === "FORWARD_TO_HUMAN") {
        await client.sendMessage(contato, "Um atendente humano irá te responder em breve.");
        marcarAtendimento(contato);
        return;
    }

    await client.sendMessage(contato, respostaIA);
}

module.exports = { processarIA };
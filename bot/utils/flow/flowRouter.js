const fs = require("fs");
const path = require("path");
const { logger } = require("../core/logger");

// IA
const { processarIA } = require("../ia/iaHandler");

/**
 * Carrega o fluxo CASES do cliente
 * Retorna a função processarMensagem do arquivo fluxoCases.js
 */
function carregarFluxoCasesCliente(clienteId) {
    const filePath = path.join(process.cwd(), "bot", "clientes", clienteId, "fluxoCases.js");

    if (!fs.existsSync(filePath)) {
        logger.error(`[FlowRouter] ❌ Cliente ${clienteId} está no modo CASE, mas não possui fluxoCases.js`);
        return null;
    }

    logger.info(`[FlowRouter] 📁 Carregando fluxo CASES do cliente: ${clienteId}`);

    // Limpa cache para recarregar alterações
    delete require.cache[require.resolve(filePath)];
    const { processarMensagem } = require(filePath);

    return processarMensagem;
}

//flowRouter – Decide entre IA ou CASES
async function flowRouter(
    msg,
    client,
    mode,
    contextoIA,
    atendimentoTemp,
    marcarAtendimento,
    boasVindas
) {
    const clienteId = client?.clienteId;
    logger.info(`[FlowRouter] Cliente "${clienteId}" usando modo: ${mode}`);

    if (mode === "case") {
        const processarCases = carregarFluxoCasesCliente(clienteId);
        if (!processarCases) {
            return client.sendMessage(msg.from, "Erro interno: fluxo CASE não encontrado.");
        }

        return processarCases(msg, client, contextoIA, atendimentoTemp, marcarAtendimento);
    }

    // Default: IA
    return processarIA(clienteId, msg.body, contextoIA, client, msg.from, marcarAtendimento, boasVindas);
}

module.exports = { flowRouter };

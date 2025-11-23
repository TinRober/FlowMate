const fs = require("fs");
const path = require("path");
const { logger } = require("../core/logger");

// IA
const { processarIA } = require("../ia/iaHandler");

// 🔥 CACHE PARA NÃO RECARREGAR O FLUXO A CADA MENSAGEM
const fluxoCache = new Map();

/**
 * Carrega o fluxo CASES do cliente APENAS UMA VEZ
 * e guarda em cache.
 */
function obterFluxoCases(clienteId) {
    if (fluxoCache.has(clienteId)) {
        return fluxoCache.get(clienteId);
    }

    const filePath = path.join(process.cwd(), "bot", "clientes", clienteId, "fluxoCases.js");

    if (!fs.existsSync(filePath)) {
        logger.error(`[FlowRouter] ❌ Cliente ${clienteId} está no modo CASE, mas não possui fluxoCases.js`);
        return null;
    }

    logger.info(`[FlowRouter] 📁 Carregando fluxo CASES do cliente (primeira vez): ${clienteId}`);

    // Remove do cache Node.js só na primeira carga
    delete require.cache[require.resolve(filePath)];

    const fluxo = require(filePath);

    if (!fluxo?.processarMensagem) {
        logger.error(`[FlowRouter] ❌ fluxoCases.js inválido para cliente ${clienteId}`);
        return null;
    }

    // Armazena no cache
    fluxoCache.set(clienteId, fluxo.processarMensagem);

    return fluxo.processarMensagem;
}

/**
 * flowRouter – Decide entre IA ou CASES (versão corrigida)
 */
async function flowRouter(
    msg,
    client,
    mode,
    contextoIA,
    atendimentoTemp,
    marcarAtendimento
) {
    const clienteId = client?.clienteId;
    logger.info(`[FlowRouter] Cliente "${clienteId}" usando modo: ${mode}`);

    // ===========================
    // MODO CASE → usa fluxoCases.js
    // ===========================
    if (mode === "case") {
        const processarCases = obterFluxoCases(clienteId);

        if (!processarCases) {
            return client.sendMessage(msg.from, "Erro interno: fluxo CASE não encontrado.");
        }

        // Agora o fluxo mantém estado real, não reinicia sempre
        return processarCases(msg, client, atendimentoTemp);
    }

    // ===========================
    // MODO IA
    // ===========================
    try {
        return await processarIA(
            clienteId,
            msg.body,
            contextoIA,
            client,
            msg.from,
            marcarAtendimento,
            false // sem boas-vindas automático
        );
    } catch (err) {
        logger.error(`[FlowRouter] Erro ao chamar IA: ${err.message}`);
        try { await client.sendMessage(msg.from, "Desculpe, ocorreu um erro interno."); } catch {}
    }
}

module.exports = { flowRouter };

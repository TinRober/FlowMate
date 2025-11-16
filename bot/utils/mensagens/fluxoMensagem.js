/**
 * TRATAMENTO PRINCIPAL DE MENSAGENS (versão final)
 * - Filtra mensagens inválidas
 * - Protege contra mensagens antigas
 * - Previne respostas duplicadas e repetidas
 * - Respeita atendimento humano
 * - Aciona IA ou CASES pelo flowRouter
 */

const { isMensagemTrivial } = require("./mensagens");
const { logger } = require("../core/logger");
const { processarMensagemId } = require("../core/messageDeduplicator");
const { contatoEmAtendimento, marcarAtendimento } = require("./atendimentoHumano");
const { isBloqueado } = require("../core/ownerBlock");
const { flowRouter } = require("../flow/flowRouter");
const { getHistory, addMessage } = require("../core/history");

async function processarMensagem(msg, client, contextoIA, atendimentoTemp, boasVindas) {
    const contato = msg.from;
    const texto = msg.body?.trim();
    const clienteId = client.clienteId;

    if (!texto) return;

    // ============================
    // 1. IGNORAR GRUPOS
    // ============================
    if (msg.isGroupMsg || contato.includes("@g.us")) {
        logger.info(`[${clienteId}] Ignorado: mensagem de grupo.`);
        return;
    }

    // ============================
    // 2. IGNORAR STATUS
    // ============================
    if (contato.includes("@status")) {
        logger.info(`[${clienteId}] Ignorado: mensagem de status.`);
        return;
    }

    // ============================
    // 3. IGNORAR DUPLICADAS
    // ============================
    if (processarMensagemId(client, msg)) {
        logger.info(`[${clienteId}] Ignorado: mensagem duplicada.`);
        return;
    }

    // ============================
    // 4. IGNORAR MENSAGENS ANTIGAS
    // ============================
    if (client.startTimestamp && msg.timestamp < client.startTimestamp) {
        logger.info(`[${clienteId}] Ignorado: mensagem antiga (${msg.timestamp}).`);
        return;
    }

    // ============================
    // 5. ATENDIMENTO HUMANO → mensagem enviada PELO cliente
    // ============================
    if (msg.fromMe) {
        logger.info(`[${clienteId}] Cliente respondeu a ${contato}. Pausando envio automático por 1 hora.`);
        marcarAtendimento(atendimentoTemp, contato, 60 * 60_000); // pausa de 1 hora
        return;
    }

    // ============================
    // 6. IGNORAR CONTATOS BLOQUEADOS
    // ============================
    if (isBloqueado(contato)) {
        logger.info(`[${clienteId}] Ignorado: contato está bloqueado.`);
        return;
    }

    // ============================
    // 7. IGNORAR SE EM ATENDIMENTO HUMANO
    // ============================
    if (contatoEmAtendimento(atendimentoTemp, contato)) {
        logger.info(`[${clienteId}] Ignorado: contato em atendimento humano.`);
        return;
    }

    // ============================
    // 8. TRIVIAIS SÓ NO IA
    // ============================
    if (client.mode === "ia" && isMensagemTrivial(texto)) {
        logger.info(`[${clienteId}] Ignorado: mensagem trivial (modo IA).`);
        return;
    }

    // ============================
    // 8b. CHECAR MENSAGENS REPETIDAS
    // ============================
    const historico = await getHistory(contato);
    if (historico.some(msgHist => msgHist.content === texto)) {
        logger.info(`[${clienteId}] Ignorado: mensagem já recebida anteriormente.`);
        return;
    }

    // Adiciona a mensagem atual ao histórico
    await addMessage(contato, "user", texto);

    // ============================
    // 9. DISPATCH FINAL → IA ou CASES
    // ============================
    try {
        await flowRouter(
            msg,
            client,
            client.mode,
            contextoIA,
            atendimentoTemp,
            marcarAtendimento,
            boasVindas
        );
    } catch (err) {
        logger.error(`[${clienteId}] Erro no flowRouter: ${err.message}`);
    }
}

module.exports = { processarMensagem };

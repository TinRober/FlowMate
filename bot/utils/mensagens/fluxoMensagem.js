/**
 * TRATAMENTO PRINCIPAL DE MENSAGENS (versão final corrigida)
 * - Bloqueio automático de 30 minutos quando você envia mensagem manual
 * - Filtra mensagens inválidas
 * - Protege contra mensagens antigas
 * - Previne respostas duplicadas e repetidas sem travar o fluxo
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

// Lista de números seus (WhatsApp) que, ao enviar mensagem, ativam bloqueio
const MEUS_NUMEROS = [
  "5531971704966@c.us",
  "553171704966@c.us", 
  "553198876543@c.us"
];

async function processarMensagem(msg, client, contextoIA, atendimentoTemp) {
    const contato = msg.from;
    const texto = msg.body?.trim();
    const clienteId = client.clienteId;

    if (!texto) return;

    // ============================
    // 1. IGNORAR GRUPOS
    // ============================
    if (msg.isGroupMsg || contato.includes("@g.us")) return;

    // ============================
    // 2. IGNORAR STATUS
    // ============================
    if (contato.includes("@status")) return;

    // ============================
    // 3. IGNORAR DUPLICADAS DE ID
    // ============================
    if (processarMensagemId(client, msg)) return;

    // ============================
    // 4. IGNORAR MENSAGENS ANTIGAS
    // ============================
    if (client.startTimestamp && msg.timestamp < client.startTimestamp) return;

    // ============================
    // 5. BLOQUEIO AUTOMÁTICO → 30 minutos
    // Somente quando você envia a mensagem 
    // ============================
    if (msg.fromMe || MEUS_NUMEROS.includes(contato)) {
        const target = msg.fromMe ? msg.to : contato;
        console.log(`[Manual] Você enviou mensagem para ${target}: "${msg.body}"`);
        marcarAtendimento(atendimentoTemp, target, 30 * 60_000); // pausa de 30 minutos
        logger.info(`[${clienteId}] Pausa de 30 min ativada para ${target} (mensagem enviada manualmente)`);
        return; // não processa flowRouter
    }

    // ============================
    // 6. IGNORAR CONTATOS BLOQUEADOS
    // ============================
    if (isBloqueado(contato)) return;

    // ============================
    // 7. IGNORAR SE EM ATENDIMENTO HUMANO / pausa de 30 min
    // ============================
    if (contatoEmAtendimento(atendimentoTemp, contato)) {
        logger.info(`[${clienteId}] Ignorado: usuário em pausa temporária (30 min).`);
        return;
    }

    // ============================
    // 8. TRIVIAIS → só ignorar se modo for IA
    // ============================
    if (client.mode === "ia" && isMensagemTrivial(texto)) {
        logger.info(`[${clienteId}] Ignorado: mensagem trivial (modo IA).`);
        // não retorna — apenas registra
    }

    // ============================
    // 8b. CHECAR MENSAGENS REPETIDAS
    // ============================
    const historico = await getHistory(contato);
    if (historico.length > 0) {
        const ultima = historico[historico.length - 1]?.content;
        if (ultima === texto && texto.length > 3) return;
    }

    // salvar mensagem no histórico
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
            marcarAtendimento
        );
    } catch (err) {
        logger.error(`[${clienteId}] Erro no flowRouter: ${err.message}`);
    }
}

module.exports = { processarMensagem };

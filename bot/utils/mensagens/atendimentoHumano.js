function contatoEmAtendimento(atendimentoTemp, contato) {
    const timestamp = atendimentoTemp[contato];
    if (!timestamp) return false;

    // Se expirou, desbloqueia automaticamente
    if (Date.now() > timestamp) {
        delete atendimentoTemp[contato];
        return false;
    }

    // Contato ainda bloqueado
    return true;
}

function marcarAtendimento(atendimentoTemp, contato, tempoMs) {
    atendimentoTemp[contato] = Date.now() + tempoMs;
}

function resetAtendimento(atendimentoTemp) {
    for (const key in atendimentoTemp) delete atendimentoTemp[key];
}

module.exports = { contatoEmAtendimento, marcarAtendimento, resetAtendimento };

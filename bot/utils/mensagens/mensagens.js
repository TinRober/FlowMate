function isMensagemTrivial(texto) {
    const triviais = ["oi", "olá", "ola", "bom dia", "boa tarde", "boa noite"];
    return triviais.includes(texto.toLowerCase());
}

async function enviarBoasVindas(client, contato, mensagem) {
    if (!client.firstMessageSent[contato]) {
        await client.sendMessage(contato, mensagem);
        client.firstMessageSent[contato] = true;
    }
}

module.exports = { isMensagemTrivial, enviarBoasVindas };
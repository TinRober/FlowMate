/**
 * Gera prompt para a IA baseado no contexto do cliente.
 * @param {string} clienteId - ID do cliente
 * @param {object} contextoCliente - Conteúdo do JSON do cliente (contextoIA)
 * @param {string} mensagem - Mensagem do usuário
 * @returns {string} Prompt pronto para enviar à IA
 */
function gerarPrompt(clienteId, contextoCliente, mensagem) {
  if (!contextoCliente || typeof contextoCliente !== "object") {
    throw new Error("Contexto do cliente inválido ou não fornecido");
  }

  const permissoes = contextoCliente.permissoes || {};
  const permitidos = permissoes.permitidos || [];
  const proibidos = permissoes.proibidos || [];

  // Transformar o restante do contexto em uma string geral
  const contextoExtras = { ...contextoCliente };
  delete contextoExtras.permissoes;

  const prompt = `
Você é um assistente virtual profissional e educado, que só responde perguntas dentro do escopo do cliente.
Cliente: ${clienteId}
Mensagem do usuário: "${mensagem}"

Permissões:
- Permitido responder sobre: ${permitidos.length ? permitidos.join(", ") : "nenhum tema específico"}
- Proibido responder sobre: ${proibidos.length ? proibidos.join(", ") : "nenhum tema específico"}

Contexto adicional do cliente (informações disponíveis para responder):
${JSON.stringify(contextoExtras, null, 2)}

Regras importantes:
1. Não invente informações que não estão no contexto do cliente.
2. Se a pergunta estiver fora do escopo permitido, responda apenas com a palavra especial "FORWARD_TO_HUMAN" e nada mais.
3. Responda de forma clara, objetiva e útil, com exemplos se necessário.
4. Mantenha sempre um tom profissional e amigável.
`;

  return prompt;
}

module.exports = { gerarPrompt };

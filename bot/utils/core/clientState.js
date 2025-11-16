/**
 * Estado do cliente WhatsApp
 * Gerencia conexão, bloqueios temporários e ping.
 */
function criarEstadoCliente() {
  let bloqueioTimeout = null;

  return {
    conexaoEstavel: false,
    bloqueado: false,
    ultimoPing: Date.now(),
    mensagensProcessadas: new Map(),

    marcarEstavel() {
      this.conexaoEstavel = true;
    },

    marcarInstavel() {
      this.conexaoEstavel = false;
    },

    bloqueioTemp(ms) {
      if (bloqueioTimeout) clearTimeout(bloqueioTimeout);
      this.bloqueado = true;
      bloqueioTimeout = setTimeout(() => {
        this.bloqueado = false;
      }, ms);
    },

    getStatus() {
      return {
        conexaoEstavel: this.conexaoEstavel,
        bloqueado: this.bloqueado,
        ultimoPing: this.ultimoPing
      };
    },

    reset() {
      this.conexaoEstavel = false;
      this.bloqueado = false;
      this.ultimoPing = Date.now();
      this.mensagensProcessadas.clear();
    }
  };
}

function marcarPing(client) {
  if (client?.estado) {
    client.estado.ultimoPing = Date.now();
  }
}

function marcarConexaoEstavel(client) {
  if (client?.estado) {
    client.estado.marcarEstavel();
  }
}

function marcarConexaoInstavel(client) {
  if (client?.estado) {
    client.estado.marcarInstavel();
  }
}

module.exports = {
  criarEstadoCliente,
  marcarPing,
  marcarConexaoEstavel,
  marcarConexaoInstavel
};
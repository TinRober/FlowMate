const fs = require("fs");
const path = require("path");
const { WhatsAppClientHandler } = require("./WhatsAppClientHandler"); 
const { logger } = require('../utils/core/logger');

class ClientManager {
  constructor() {
    this.clients = new Map();
    this.clientesDir = path.join(process.cwd(), "bot", "clientes");
  }

  loadClients() {
    const files = fs.readdirSync(this.clientesDir).filter(f => f.endsWith(".json"));
    return files.map(f => path.basename(f, ".json"));
  }

  async startAllClients() {
    const clienteIds = this.loadClients();
    for (const id of clienteIds) {
      await this.startClient(id);
    }
  }

  async startClient(clienteId) {
    if (this.clients.has(clienteId)) {
      logger.warn(`Cliente ${clienteId} já está iniciado.`);
      return;
    }
    const handler = new WhatsAppClientHandler(clienteId);
    await handler.initialize();
    this.clients.set(clienteId, handler);
    logger.info(`Cliente ${clienteId} iniciado com sucesso.`);
  }

  async restartClient(clienteId) {
    if (this.clients.has(clienteId)) {
      await this.clients.get(clienteId).destroy();
      this.clients.delete(clienteId);
    }
    await this.startClient(clienteId);
  }

  getClientStatus(clienteId) {
    return this.clients.get(clienteId)?.getStatus() || "Não iniciado";
  }

  async stopAllClients() {
    for (const [id, handler] of this.clients.entries()) {
      await handler.destroy();
      logger.info(`Cliente ${id} parado.`);
    }
    this.clients.clear();
  }
}

module.exports = { ClientManager };
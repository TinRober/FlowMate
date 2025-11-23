const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcodeTerminal = require("qrcode-terminal");
const qrcodeImage = require("qrcode");
const fs = require("fs");
const path = require("path");

const { logger, logMessage } = require('../utils/core/logger');
const { processarMensagem } = require('../utils/mensagens/fluxoMensagem');
const { marcarAtendimento, resetAtendimento } = require('../utils/mensagens/atendimentoHumano');
const { iniciarWatchdog, marcarPing } = require('../utils/core/watchdog');

class WhatsAppClientHandler {
    constructor(clienteId) {
        this.clienteId = clienteId;
        this.client = null;

        this.sessionPath = path.join(__dirname, `../instances/${clienteId}/session-${clienteId}`);
        this.qrDir = path.join(__dirname, "../qrcodes");
        this.clientesDir = path.join(process.cwd(), "bot/clientes");
        this.chromiumPath = process.env.CHROME_PATH || "/usr/bin/chromium-browser";

        this.BLOQUEIO_RECONNECT_MS = 8000;
        this.botAtivo = false;

        this.contextoIA = null;
        this.contextoCliente = null;

        this.mode = "ia"; // Valor padrão 

        this.TEMPO_ATENDIMENTO_MS = 30 * 60_000;
        this.atendimentoTemp = {};

        this.watchdog = null; 
    }

    async initialize() {
        try {
            logger.info(`🟡 Iniciando cliente ${this.clienteId}...`);
            resetAtendimento(this.atendimentoTemp);

            // Carregar JSON do cliente
            const configPath = path.join(this.clientesDir, this.clienteId, `${this.clienteId}.json`);
            let clienteConfig = {};

            if (fs.existsSync(configPath)) {
                clienteConfig = JSON.parse(fs.readFileSync(configPath));
                this.contextoIA = clienteConfig.contextoIA || {};
                this.contextoCliente = clienteConfig;
                this.mode = clienteConfig.mode || "ia";
                logger.info(`[${this.clienteId}] Modo carregado: ${this.mode}`);
            }

            // Criar instância WhatsAppWebJS
            this.client = new Client({
                authStrategy: new LocalAuth({
                    clientId: this.clienteId,
                    dataPath: path.join(process.cwd(), "bot/.wwebjs_cache")
                }),
                puppeteer: {
                    headless: true,
                    executablePath: this.chromiumPath,
                    args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-software-rasterizer"]
                }
            });

            // sem isso o flowRouter não sabe quem é o cliente
            this.client.clienteId = this.clienteId;
            this.client.mode = this.mode;
            if (this.mode === "ia") this.client.boasVindas = clienteConfig.mensagemBoasVindas;
            this.client.firstMessageSent = {};
            this.client.startTimestamp = Math.floor(Date.now() / 1000);

            this.setupEvents();

            await this.client.initialize();
            this.botAtivo = true;

            // Inicia watchdog
            this.watchdog = iniciarWatchdog(
                this.client,
                this.clienteId,
                async () => {
                    logger.info(`[${this.clienteId}] Reiniciando cliente via watchdog...`);
                    if (this.watchdog) clearInterval(this.watchdog);
                    this.botAtivo = false;
                    await this.initialize();
                },
                30_000,       // intervalo de checagem
                5 * 60_000    // timeout (5 minutos sem ping)
            );

            logger.info(`[${this.clienteId}] Bot ativado e cliente iniciado com sucesso!`);

        } catch (err) {
            logger.error(`Falha ao iniciar cliente ${this.clienteId}: ${err.message}`);
            logger.error(err.stack);
        }
    }

    setupEvents() {
        const client = this.client;

        // QR CODE
        client.on("qr", async qr => {
            qrcodeTerminal.generate(qr, { small: true });
            const qrPath = path.join(this.qrDir, `qrcode-${this.clienteId}.png`);
            await qrcodeImage.toFile(qrPath, qr);
        });

        // READY → cliente pronto
        client.on("ready", () => {
            logger.info(`✅ Cliente ${this.clienteId} conectado e estável.`);
            marcarPing(client);
        });

        // AUTHENTICATED → autenticação concluída
        client.on("authenticated", () => {
            logger.info(`[${this.clienteId}] Cliente autenticado com sucesso.`);
            marcarPing(client);
        });

        // Recebimento de mensagem
        client.on("message", async msg => {
            try {
                marcarPing(client); 
                logMessage("RECEIVED", msg.from, msg.body, this.clienteId);
                await processarMensagem(msg, client, this.contextoIA, this.atendimentoTemp, client.boasVindas);
            } catch (err) {
                logger.error(`Erro ao processar mensagem do cliente ${this.clienteId}: ${err.message}`);
            }
        });

        // MENSAGENS CRIADAS → mensagens enviadas pelo próprio cliente
        client.on("message_create", msg => {
            marcarPing(client);
        });

    }

    async destroy() {
        if (this.client) {
            await this.client.destroy();
            this.botAtivo = false;
            if (this.watchdog) clearInterval(this.watchdog);
            logger.info(`[${this.clienteId}] Cliente destruído.`);
        }
    }

    getStatus() {
        return this.botAtivo ? "Ativo" : "Inativo";
    }
}

module.exports = { WhatsAppClientHandler };


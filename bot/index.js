require('dotenv').config({ override: true });

console.log(">>> INDEX EXECUTADO:", __filename);
console.log(">>> INICIANDO INDEX <<<");

const { WhatsAppClientHandler } = require('./manager/WhatsAppClientHandler');

console.log(">>> IMPORT DO HANDLER OK <<<");

// Captura o ID do cliente passado via argumento
const clienteId = process.argv.find(arg => arg.startsWith('--id='))?.split('=')[1];

if (!clienteId) {
    console.error('❌ ID do cliente não informado. Use: node bot/index.js --id=SEU_ID');
    process.exit(1);
}

console.log(`>>> CLIENTE ID DETECTADO: ${clienteId} <<<`);

// Inicializa o handler
(async () => {
    try {
        console.log(` Iniciando bot para cliente: ${clienteId}`);
        const handler = new WhatsAppClientHandler(clienteId);

        console.log(">>> CHAMANDO handler.initialize() <<<");

        await handler.initialize();

        console.log(">>> BOT INICIALIZADO COM SUCESSO <<<");
    } catch (error) {
        console.error(`❌ Erro ao iniciar bot: ${error.message}`);
        console.error(error.stack);
    }
})();

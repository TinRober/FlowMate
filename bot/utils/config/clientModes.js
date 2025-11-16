//* Controle do modo de operação por cliente:
// * - "ia" (padrão)
// * - "cases"


const modosClientes = {};

 //Retorna o modo atual de um cliente.

function getMode(clienteId) {
    return modosClientes[clienteId] || "ia";
}

// altera o modo do cliente
function setMode(clienteId, mode) {
    modosClientes[clienteId] = mode;
}

module.exports = {
    getMode,
    setMode
};

const fs = require("fs");
const path = require("path");

/**
 * Armazena os bloqueios por número
 * chave: número (string)
 * valor: timestamp em ms indicando até quando está bloqueado
 */
const bloqueios = new Map();

//bloqueio padrão
const BLOQUEIO_PADRAO_MS = 30 * 60_000;

// Caminho do arquivo para persistência opcional 
const STORE_PATH = path.join(__dirname, "../data/bloqueios.json");


// Normaliza números (remove espaços e letras)
function normalizarNumero(numero) {
  if (!numero) return null;
  return String(numero).replace(/\D+/g, "");
}

// Remove bloqueios expirados automaticamente
function limparExpirados() {
  const agora = Date.now();
  for (const [numero, ate] of bloqueios.entries()) {
    if (agora >= ate) {
      bloqueios.delete(numero);
    }
  }
}

// Persiste os dados em arquivo (modo seguro)
function salvarSePossivel() {
  try {
    const obj = Object.fromEntries(bloqueios);
    const json = JSON.stringify(obj, null, 2);
    fs.writeFileSync(STORE_PATH, json);
  } catch (err) {
    console.error("[ownerBlock] Falha ao salvar persistência:", err.message);
  }
}

//Carrega dados persistidos
(function carregarPersistencia() {
  try {
    if (fs.existsSync(STORE_PATH)) {
      const data = JSON.parse(fs.readFileSync(STORE_PATH));
      for (const numero in data) {
        bloqueios.set(numero, data[numero]);
      }
    }
  } catch (err) {
    console.error("[ownerBlock] Falha ao carregar persistência:", err.message);
  }
})();
  

 // Bloqueia o atendimento para um número
function bloquearAtendimento(numero, tempoMs = BLOQUEIO_PADRAO_MS) {
  const n = normalizarNumero(numero);
  if (!n) return;

  limparExpirados();

  bloqueios.set(n, Date.now() + tempoMs);
  salvarSePossivel();
}

// Verifica se o número está bloqueado
function isBloqueado(numero) {
  const n = normalizarNumero(numero);
  if (!n) return false;

  limparExpirados();

  const ate = bloqueios.get(n);
  return ate && Date.now() < ate;
}

// Retorna tempo restante em segundos
function tempoRestante(numero) {
  const n = normalizarNumero(numero);
  if (!n) return null;

  limparExpirados();

  const ate = bloqueios.get(n);
  if (!ate) return null;

  const restante = ate - Date.now();
  return restante > 0 ? Math.ceil(restante / 1000) : null;
}

//Remove um bloqueio manualmente

function removerBloqueio(numero) {
  const n = normalizarNumero(numero);
  if (!n) return;

  bloqueios.delete(n);
  salvarSePossivel();
}

module.exports = {
  bloquearAtendimento,
  isBloqueado,
  tempoRestante,
  removerBloqueio
};

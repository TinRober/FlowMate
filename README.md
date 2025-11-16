# FlowMate - WhatsApp Automation com IA

FlowMate é uma plataforma de automação de atendimento via WhatsApp, suportando múltiplas instâncias independentes, integração com IA generativa e fluxo inteligente de mensagens. O sistema é preparado para deployment em Linux, Docker e AWS, com arquitetura escalável, logs centralizados e persistência isolada por cliente.

---

## Tecnologias

* Node.js
* WhatsApp-Web.js
* Puppeteer
* OpenAI API
* Linux
* Docker
* AWS (em desenvolvimento)
* Fluxo inteligente de mensagens

---

## Recursos Principais

* Fluxo inteligente de mensagens: roteador de mensagens, modo IA e modo CASES.
* Deduplicação avançada: evita respostas duplicadas e loops.
* Watchdog de estabilidade: reinicia automaticamente sessões travadas.
* Atendimento humano assistido: pausa automática do bot ao detectar interação manual.
* Persistência isolada por cliente: contexto, histórico, configuração e sessão.
* Filtragem de mensagens: anti-spam, anti-grupo, anti-status e mensagens triviais.
* Controle de boas-vindas inteligente: evita múltiplos envios.
* Deploy preparado para Linux: com Chromium externo.
* Containerização: preparado para Docker e AWS.
* Arquitetura escalável: logs centralizados, modularização e validação de fluxo.
* Preparação para API oficial do WhatsApp Business: fácil migração futura.

---

## Pré-requisitos

* Node.js v18+
* npm ou yarn
* Chromium instalado
* Acesso a terminal Linux, macOS ou Windows (WSL recomendado para Windows)

---

## Instalação

1. Clone o repositório:

```
git clone https://github.com/TinRober/FlowMate.git
cd FlowMate
```

2. Instale dependências:

```
npm install
ou
yarn install
```

3. Configure a variável de ambiente para o Chromium (Linux):

```
export CHROME_PATH=/usr/bin/chromium
```

ou adicione ao `.env`:

```
CHROME_PATH=/usr/bin/chromium
```

---

## Criando e rodando um usuário

1. Criar a pasta do cliente:

```
mkdir -p bot/clientes/Cliente1
```

2. Criar arquivo de configuração em `bot/clientes/Cliente1/Cliente1.json`:

```
{
  "mode": "ia",
  "mensagemBoasVindas": "Olá! Bem-vindo(a) ao FlowMate!",
  "contextoIA": {},
  "outrasConfiguracoes": {}
}
```

3. Inicializar o cliente:

```
node bot/index.js --id=Cliente1
```

* O `--id` deve corresponder ao nome da pasta/arquivo JSON do cliente. O bot cria automaticamente a sessão em `bot/instances/Cliente1/`.

4. QR Code na primeira execução:

* Será exibido no terminal.
* Também será salvo em `bot/qrcodes/qrcode-Cliente1.png`.

5. Mensagens e monitoramento:

* Mensagens são processadas pelo modo configurado (`ia` ou `case`).
* Logs são exibidos no console e salvos em `logs/`.
* Watchdog reinicia automaticamente clientes travados.

---


## Comandos úteis

* Rodar um cliente específico:

```
node bot/index.js --id=Cliente1
```

* Reiniciar o cliente travado: watchdog faz isso automaticamente.
* Visualizar logs: em `logs/` ou no console.

---

## Contribuindo

1. Fork o repositório.
2. Crie sua branch: `git checkout -b minha-feature`.
3. Faça commits das alterações: `git commit -m "Minha feature"`.
4. Push para sua branch: `git push origin minha-feature`.
5. Abra um Pull Request.

---

## Licença

MIT License © 2025 Roberto Alzir Galarani Chaves

---

## Contato

* GitHub: [TinRober](https://github.com/TinRober)
* E-mail: [galarani.dev@gmail.com](mailto:galarani.dev@gmail.com)

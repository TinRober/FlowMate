# FlowMate

![FlowMate Logo](https://img.shields.io/badge/FlowMate-WhatsApp%20Automation-green)
![Node.js](https://img.shields.io/badge/Node.js-v18.x-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

FlowMate é uma plataforma de automação para WhatsApp com integração de IA generativa. Permite criar múltiplas instâncias independentes, suporte a atendimento humano assistido, filtragem de mensagens e controle inteligente de fluxos.

---

## 🔹 Features

- **Fluxo inteligente de mensagens**: roteador, modo IA e modo CASES.  
- **Deduplicação avançada**: evita respostas duplicadas e loops.  
- **Watchdog de estabilidade**: reinicializa automaticamente sessões travadas.  
- **Atendimento humano assistido**: pausa automática do bot ao detectar interação manual.  
- **Persistência isolada por cliente**: histórico, contexto, sessão e configurações separadas.  
- **Filtragem automática de mensagens**: anti-spam, anti-grupo, anti-status, mensagens triviais.  
- **Mensagem de boas-vindas inteligente**: evita múltiplos envios.  
- **Deploy em Linux preparado**: suporta Chromium externo.  
- **Estrutura pronta para Docker e AWS**: fácil containerização e deploy em nuvem.  
- **Arquitetura escalável e modular**: logs centralizados e validação de fluxo.  
- **Preparado para futura migração**: API oficial do WhatsApp Business.  

---

## 🔹 Tecnologias

- Node.js • WhatsApp-Web.js • Puppeteer • OpenAI API  
- Linux, Docker, AWS  
- Arquitetura modular com logs e histórico persistente  

---

## 🔹 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/TinRober/FlowMate.git
cd FlowMate
Instale dependências:

bash
Copiar código
npm install
Configure variáveis de ambiente:

Crie um arquivo .env na raiz do projeto com as variáveis necessárias, por exemplo:

env
Copiar código
CHROME_PATH=/usr/bin/chromium
OPENAI_API_KEY=your_openai_key
Inicie o bot:

bash
Copiar código
node bot/index.js --id=nomeDoCliente
🔹 Estrutura do projeto
bash
Copiar código
FlowMate/
│
├─ bot/                   # Código do bot
│  ├─ index.js            # Inicialização do cliente
│  ├─ WhatsAppClient.js   # Handler do cliente
│  └─ instances/          # Sessões e histórico dos clientes
│
├─ utils/                 # Funções auxiliares
│  ├─ mensagens/          # Fluxo de mensagens IA e CASES
│  ├─ core/               # Logger, deduplicação e controles
│  └─ atendimentoHumano.js
│
├─ clientes/              # Configurações por cliente (ignoradas pelo git)
├─ dist/                  # Arquivos compilados / bundle (ignorados pelo git)
├─ .env                   # Variáveis de ambiente (ignoradas pelo git)
└─ package.json
🔹 Contribuição
Contribuições são bem-vindas! Para adicionar melhorias:

Fork o repositório

Crie uma branch para sua feature (git checkout -b minha-feature)

Commit suas alterações (git commit -m 'Minha feature')

Push para a branch (git push origin minha-feature)

Abra um Pull Request

🔹 Licença
MIT License © Roberto Galarani

🔹 Contato
GitHub: https://github.com/TinRober

Email: galarani.dev@gmail.com
# 🎮 Stream Trophy

Sistema para integração com a PlayStation Network (PSN) com objetivo de capturar e exibir informações de troféus em tempo real para uso em streams.

---

## 🚀 Funcionalidades

- 🔐 Autenticação com a PSN
- 🏆 Consulta de troféus
- 📡 Serviço backend em Node.js
- 🌍 API local para integração com overlays de streaming
- ⚙️ Uso de variáveis de ambiente com dotenv

---

## 🛠 Tecnologias Utilizadas

- Node.js  
- Express  
- Dotenv  
- Integração com API da PlayStation Network  

---

## 📂 Estrutura do Projeto

```
stream-trophy/
│
├── public/
│   ├── icons/
│   |   ├── Bronze.png
│   |   ├── Gold.png
│   |   ├── Silver.png
│   |   └── Platinum.png
│   ├── progress.html
│   ├── progress.css
│   ├── progress.js
│   ├── trophy.html
│   ├── trophy.css
│   └── trophy.js
│
├── src/
│   ├── server.js
│   ├── psnService.js
│   └── route.js
│
├── .env
├── cache.json
├── .gitignore
├── package.json
└── README.md
```

---

## ⚙️ Configuração

### 1️⃣ Clone o repositório

```bash
git clone https://github.com/CesarPradoJr/stream-trophy.git
cd stream-trophy
```

### 2️⃣ Instale as dependências

```bash
npm install
```

### 3️⃣ Configure o arquivo `.env`

Crie um arquivo `.env` na raiz do projeto:

```env
PSN_CLIENT_ID=seu_client_id
PSN_CLIENT_SECRET=seu_client_secret
PSN_REDIRECT_URI=sua_redirect_uri
```

---

## ▶️ Executando o Projeto

```bash
node src/server.js
```

ou, se tiver script configurado:

```bash
npm start
```

---

## 📌 Possíveis Erros

### ❌ Falha ao obter tokens da PSN

Verifique:

- Se as credenciais no `.env` estão corretas
- Se o redirect URI está configurado corretamente no app da PSN
- Se o arquivo `.env` está sendo carregado corretamente

---

## 🔒 Segurança

⚠️ Nunca envie o arquivo `.env` para o GitHub.

Adicione ao `.gitignore`:

```
.env
```

---

## 🎯 Objetivo do Projeto

O objetivo do **Stream Trophy** é permitir que criadores de conteúdo exibam seus troféus da PSN automaticamente durante transmissões, criando uma experiência mais interativa para o público.

---

## 📈 Melhorias Futuras

- Interface web
- WebSocket para atualização em tempo real
- Cache de troféus
- Deploy em nuvem
- Integração com OBS

---

## 👨‍💻 Autor

Desenvolvido por **César Prado**

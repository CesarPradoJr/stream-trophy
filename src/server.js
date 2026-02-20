require("dotenv").config();
const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const axios = require("axios");

const {
  authenticate,
  getCurrentGame
} = require("./psnService");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static("public"));

let tokens = null;
let lastGame = null;
let lastProgress = null;
let earnedTrophiesCache = new Set();
let clients = [];
let currentCover = null;
let coverCache = new Map();

// -----------------------------
// Inicializa PSN
// -----------------------------
async function init() {
  try {
    tokens = await authenticate();
    console.log("✅ PSN pronta");

    const game = await getCurrentGame();
    if (game) {
  lastGame = game;
  lastProgress = game.progress;

  console.log("🎮 Jogo inicial:", game.title);

  // 🔥 BUSCA A CAPA AQUI
  currentCover = await getGameCover(game.title);
  console.log("🖼️ Capa inicial carregada:", currentCover);

  // Inicializa cache
  game.trophies.forEach(trophy => {
    if (trophy.earned) {
      earnedTrophiesCache.add(trophy.id);
    }
  });

  const payload = buildProgressPayload(game);
  if (payload) {
    broadcast(payload);
    console.log("📊 Progresso inicial enviado:", payload.percentage + "%");
  }
}


  } catch (err) {
    console.error("❌ Erro na autenticação:", err.message);
  }
}

// -----------------------------
// Servidor HTTP
// -----------------------------
const server = app.listen(PORT, () => {
  console.log(`🌍 Servidor rodando em http://localhost:${PORT}`);
});

// -----------------------------
// WebSocket
// -----------------------------
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("📡 Overlay conectada");
  clients.push(ws);

  if (lastGame) {
    const payload = buildProgressPayload(lastGame);
    if (payload) ws.send(JSON.stringify(payload));
  }

  ws.on("close", () => {
    clients = clients.filter(c => c !== ws);
  });
});

// -----------------------------
// Broadcast
// -----------------------------
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// -----------------------------
// Payload progresso
// -----------------------------
function buildProgressPayload(game) {
  
  if (!game) return null;

  console.log("🎮 Capa enviada:", currentCover);

  return {
    type: "progress",
    game: game.title,
    cover: currentCover,
    bronze: game.earned.bronze || 0,
    silver: game.earned.silver || 0,
    gold: game.earned.gold || 0,
    platinum: game.earned.platinum || 0,
    totalBronze: game.total.bronze || 0,
    totalSilver: game.total.silver || 0,
    totalGold: game.total.gold || 0,
    totalPlatinum: game.total.platinum || 0,
    percentage: game.progress || 0
  };
  

}

// -----------------------------
// LOOP INTELIGENTE — 30s
// -----------------------------
setInterval(async () => {
  if (!tokens) return;

  try {
    const game = await getCurrentGame();
    if (!game) return;

    // 🎮 Detecta troca de jogo
    if (!lastGame || game.npCommunicationId !== lastGame.npCommunicationId) {
  console.log("🎮 Jogo mudou:", game.title);

  earnedTrophiesCache.clear();
  lastProgress = null;

  currentCover = await getGameCover(game.title);

  game.trophies.forEach(trophy => {
    if (trophy.earned) {
      earnedTrophiesCache.add(trophy.id);
    }
  });
}

    // 📊 Atualiza progresso sempre
    const progressPayload = buildProgressPayload(game);
    broadcast(progressPayload);

    // 🧠 Só verifica troféu se progresso mudou
    if (game.progress !== lastProgress) {

      console.log("📈 Progresso mudou! Verificando troféus...");

      const newTrophies = [];

      game.trophies.forEach(trophy => {
        if (trophy.earned && !earnedTrophiesCache.has(trophy.id)) {
          earnedTrophiesCache.add(trophy.id);
          newTrophies.push(trophy);
        }
      });

      newTrophies.forEach(trophy => {
        broadcast({
          type: "NEW_TROPHY",
          data: {
            game: game.title,
            ...trophy
          }
        });

        console.log("🏆 Novo troféu:", trophy.name);
      });

      lastProgress = game.progress;
    }

    lastGame = game;

  } catch (error) {
    console.error("Erro no monitor:", error.message);
  }

}, 30000);

async function getGameCover(gameName) {
  try {

    // Remove símbolos tipo ™ ® ©
    const cleanName = gameName.replace(/[™®©]/g, "").trim();

    console.log("🔎 Buscando capa para:", cleanName);

    const response = await axios.get("https://api.rawg.io/api/games", {
      params: {
        key: process.env.RAWG_API_KEY,
        search: cleanName, 
        dates: `${new Date().getFullYear()}-01-01,${new Date().getFullYear()}-12-31`,
        page_size: 1
      }
    });

    const results = response.data.results;

    if (results && results.length > 0) {
      console.log("✅ Capa encontrada:", results[0].background_image);
      return results[0].background_image;
    }

    console.log("⚠️ Nenhuma capa encontrada");
    return null;

  } catch (error) {
    console.error("Erro buscando capa:", error.message);
    return null;
  }
}

// -----------------------------
init();

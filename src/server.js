require("dotenv").config();
const express = require("express");
const path = require("path");
const WebSocket = require("ws");
const axios = require("axios");

const {
  authenticate,
  getCurrentGame
} = require("./psnService");
const { platform } = require("os");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static("public"));

let tokens = null;
let lastGame = null;
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

      currentCover = await getGameCover(
        game.title,
        game.trophyTitlePlatform
      );

      game.trophies.forEach(trophy => {
        if (trophy.earned && trophy.earnedDateTime) {
          earnedTrophiesCache.add(
            `${trophy.id}_${trophy.earnedDateTime}`
          );
        }
      });

      const payload = buildProgressPayload(game);
      if (payload) broadcast(payload);
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
function broadcast(data) {
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// -----------------------------
function buildProgressPayload(game) {
  if (!game) return null;

  return {
    type: "progress",
    game: game.title,
    platform: game.trophyTitlePlatform,
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
// LOOP DE MONITORAMENTO (10s)
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
      currentCover = await getGameCover(
        game.title,
        game.trophyTitlePlatform
      );

      game.trophies.forEach(trophy => {
        if (trophy.earned && trophy.earnedDateTime) {
          earnedTrophiesCache.add(
            `${trophy.id}_${trophy.earnedDateTime}`
          );
        }
      });
    }

    // 📊 Sempre atualiza progresso
    broadcast(buildProgressPayload(game));

    // 🏆 Detecta novos troféus
    const newTrophies = [];

    game.trophies.forEach(trophy => {
      if (
        trophy.earned &&
        trophy.earnedDateTime &&
        !earnedTrophiesCache.has(
          `${trophy.id}_${trophy.earnedDateTime}`
        )
      ) {
        earnedTrophiesCache.add(
          `${trophy.id}_${trophy.earnedDateTime}`
        );
        newTrophies.push(trophy);
      }
    });

    // Ordena por data
    newTrophies.sort(
      (a, b) =>
        new Date(a.earnedDateTime) - new Date(b.earnedDateTime)
    );

    newTrophies.forEach(trophy => {
      broadcast({
        type: "NEW_TROPHY",
        data: {
          game: game.title,
          platform: game.trophyTitlePlatform,
          cover: currentCover,
          id: trophy.id,
          name: trophy.name,
          description: trophy.description,
          type: trophy.type,
          rarity: trophy.rarity,
          icon: trophy.icon,
          earnedDateTime: trophy.earnedDateTime
        }
      });

      console.log("🏆 Novo troféu enviado:", trophy.name);
    });

    lastGame = game;

  } catch (error) {
    console.error("Erro no monitor:", error.message);
  }

}, 10000);


// -----------------------------
async function getGameCover(gameName, platform) {
  try {
    if (coverCache.has(gameName + platform)) {
      return coverCache.get(gameName + platform);
    }

    const cleanName = gameName.replace(/[™®©]/g, "").trim();
    console.log("Buscando capa para:", gameName, "Plataforma:", platform);
    // 🔥 Converte PSN → RAWG
    let rawgPlatformId = null;

    if (platform === "PS4") rawgPlatformId = 18;
    if (platform === "PS5") rawgPlatformId = 187;

    const response = await axios.get(
      "https://api.rawg.io/api/games",
      {
        params: {
          key: process.env.RAWG_API_KEY,
          search: cleanName,
          page_size: 1,
          platforms: rawgPlatformId || undefined
        }
      }
    );

    const results = response.data.results;

    if (results && results.length > 0) {
      const cover = results[0].background_image;
      coverCache.set(gameName + platform, cover);
      return cover;
    }

    return null;

  } catch (error) {
    console.error("Erro buscando capa:", error.message);
    return null;
  }
}

init();
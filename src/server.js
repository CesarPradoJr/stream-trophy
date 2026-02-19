console.log("INICIANDO SERVIDOR...");

require("dotenv").config();

const express = require("express");
const WebSocket = require("ws");
const cron = require("node-cron");

const psnService = require("./psnService");
const trophyService = require("./trophyService");

const app = express();
const PORT = process.env.PORT || 3000;

let wss;

async function init() {
  await psnService.authenticate(process.env.NPSSO);
  console.log("Autenticado na PSN");
}

async function checkTrophies() {
  const currentGame = await psnService.getCurrentGame();
  const trophies = await psnService.getTrophiesForGame(currentGame.npCommunicationId);

  const cache = trophyService.loadCache();
  const newTrophies = trophyService.detectNewTrophies(cache, trophies);

  if (newTrophies.length > 0) {
    newTrophies.forEach(trophy => {
      wss.clients.forEach(client => {
        client.send(JSON.stringify({
          type: "NEW_TROPHY",
          data: trophy
        }));
      });
    });
  }

  trophyService.saveCache({
    currentGame: currentGame.trophyTitleName,
    earnedTrophies: trophies.trophies
      .filter(t => t.earned)
      .map(t => t.trophyId)
  });

  // Enviar progresso
  wss.clients.forEach(client => {
    client.send(JSON.stringify({
      type: "PROGRESS_UPDATE",
      data: {
        game: currentGame.trophyTitleName,
        progress: trophies.summary.progress,
        earned: trophies.summary.earnedTrophies
      }
    }));
  });
}

app.use(express.static("public"));

const server = app.listen(PORT, async () => {
  await init();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

wss = new WebSocket.Server({ server });

cron.schedule("*/30 * * * * *", async () => {
  try {
    await checkTrophies();
  } catch (err) {
    console.log("Erro:", err.message);
  }
});

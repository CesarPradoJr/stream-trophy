const fs = require("fs");

function loadCache() {
  if (!fs.existsSync("cache.json")) {
    fs.writeFileSync("cache.json", JSON.stringify({
      currentGame: null,
      earnedTrophies: []
    }, null, 2));
  }

  return JSON.parse(fs.readFileSync("cache.json"));
}

function saveCache(data) {
  fs.writeFileSync("cache.json", JSON.stringify(data, null, 2));
}

function detectNewTrophies(oldCache, trophies) {
  const newOnes = [];

  trophies.trophies.forEach(t => {
    if (t.earned && !oldCache.earnedTrophies.includes(t.trophyId)) {
      newOnes.push(t);
    }
  });

  return newOnes;
}

module.exports = {
  loadCache,
  saveCache,
  detectNewTrophies
};

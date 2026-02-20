const express = require("express");
const router = express.Router();
const { getProfile, getGames, getTrophies } = require("./psnService");

router.get("/profile", async (req, res) => {
  try {
    const profile = await getProfile();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/games", async (req, res) => {
  try {
    const games = await getGames();
    res.json(games);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/trophies/:titleId", async (req, res) => {
  try {
    const trophies = await getTrophies(req.params.titleId);
    res.json(trophies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

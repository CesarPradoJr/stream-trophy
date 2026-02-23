const {
  exchangeNpssoForCode,
  exchangeCodeForAccessToken,
  getUserTitles,
  getUserTrophiesEarnedForTitle,
  getTitleTrophies
} = require("psn-api");

let authorization = null;

async function authenticate() {
  const npsso = process.env.NPSSO;
  if (!npsso) throw new Error("NPSSO não definido no .env");

  const accessCode = await exchangeNpssoForCode(npsso);
  authorization = await exchangeCodeForAccessToken(accessCode);

  console.log("✅ Autenticado na PSN!");
  return authorization;
}

async function getCurrentGame() {
  if (!authorization?.accessToken) {
    throw new Error("Não autenticado na PSN");
  }

  const userTitles = await getUserTitles(
    { accessToken: authorization.accessToken },
    "me"
  );

  if (!userTitles?.trophyTitles?.length) return null;

  const sorted = userTitles.trophyTitles.sort(
    (a, b) =>
      new Date(b.lastUpdatedDateTime) - new Date(a.lastUpdatedDateTime)
  );

  const lastPlayed = sorted[0];

  const trophies = await getTrophiesForGame(lastPlayed.npCommunicationId);

  return {
    npCommunicationId: lastPlayed.npCommunicationId,
    title: lastPlayed.trophyTitleName,
    trophyTitlePlatform: lastPlayed.trophyTitlePlatform,
    progress: lastPlayed.progress,
    earned: lastPlayed.earnedTrophies,
    total: lastPlayed.definedTrophies,
    trophies
  };
}

async function getTrophiesForGame(npCommunicationId) {
  if (!authorization?.accessToken) {
    throw new Error("Não autenticado na PSN");
  }

  const auth = { accessToken: authorization.accessToken };

  const trophyGroups = await getTitleTrophies(auth, npCommunicationId, "all", {
    npServiceName: "trophy"
  });

  const earned = await getUserTrophiesEarnedForTitle(
    auth,
    "me",
    npCommunicationId,
    "all",
    { npServiceName: "trophy" }
  );

  const allTrophies =
    trophyGroups?.trophyGroups?.flatMap(group => group.trophies) || [];

  const earnedList = earned?.trophies || [];

  const trophies = allTrophies.map(trophy => {
    const earnedData = earnedList.find(
      t => t.trophyId === trophy.trophyId
    );

    return {
      id: trophy.trophyId,
      name: trophy.trophyName,
      description: trophy.trophyDetail || "",
      icon: trophy.trophyIconUrl || "",
      type: trophy.trophyType.toLowerCase(),
      rarity: trophy.trophyRare || null,
      earned: earnedData?.earned || false,
      earnedDateTime: earnedData?.earnedDateTime || null
    };
  });

  return trophies;
}

module.exports = {
  authenticate,
  getCurrentGame
};
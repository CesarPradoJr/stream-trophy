const {
  exchangeNpssoForAccessCode,
  exchangeAccessCodeForAuthTokens,
  getUserTitles,
  getUserTrophiesEarnedForTitle
} = require("psn-api");

let authTokens;
let accountId;

async function authenticate(npsso) {
  const accessCode = await exchangeNpssoForAccessCode(npsso);
  const tokens = await exchangeAccessCodeForAuthTokens(accessCode);

  authTokens = tokens;
  accountId = tokens.accountId;

  if (!authTokens || !accountId) {
    throw new Error("Falha ao obter tokens da PSN.");
  }
}

async function getCurrentGame() {
  if (!authTokens) throw new Error("Não autenticado.");

  const titles = await getUserTitles(
    { accessToken: authTokens.accessToken },
    accountId
  );

  return titles.trophyTitles[0];
}

async function getTrophiesForGame(npCommunicationId) {
  if (!authTokens) throw new Error("Não autenticado.");

  return await getUserTrophiesEarnedForTitle(
    { accessToken: authTokens.accessToken },
    accountId,
    npCommunicationId
  );
}

module.exports = {
  authenticate,
  getCurrentGame,
  getTrophiesForGame
};

const socket = new WebSocket("ws://localhost:3000");

const popup = document.getElementById("trophy-popup");
const trophyName = document.getElementById("trophy-name");
const trophyGame = document.getElementById("trophy-game");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "NEW_TROPHY") {

    const trophy = data.data;

    trophyName.innerText = trophy.name;
    trophyGame.innerText = trophy.game;

    // remove classes antigas
    popup.classList.remove("bronze", "silver", "gold", "platinum");

    // adiciona raridade
    if (trophy.type) {
      popup.classList.add(trophy.type);
    }

    popup.classList.remove("hidden");
    popup.classList.add("show");

    setTimeout(() => {
      popup.classList.remove("show");
      popup.classList.add("hidden");
    }, 6000);
  }
};

socket.onopen = () => {
  console.log("📡 Trophy overlay conectada");
};

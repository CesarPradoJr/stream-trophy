const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "progress") {

    // 🎮 Aplica a imagem SOMENTE na overlay
    if (data.cover) {
      const container = document.querySelector(".progress-container");
      container.style.backgroundImage = `url('${data.cover}')`;
    }

    document.getElementById("game-name").innerText = data.game;
    document.getElementById("percentage").innerText = data.percentage + "%";
    document.getElementById("progress-fill").style.width = data.percentage + "%";

    document.getElementById("bronze-count").innerText = data.bronze;
    document.getElementById("silver-count").innerText = data.silver;
    document.getElementById("gold-count").innerText = data.gold;
    document.getElementById("platinum-count").innerText = data.platinum;
  }
};

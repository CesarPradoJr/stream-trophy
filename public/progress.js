const socket = new WebSocket("ws://localhost:3000");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "progress") {

    const container = document.querySelector(".progress-container");

    // 🎮 Atualiza capa
    if (data.cover) {
      container.style.backgroundImage = `url('${data.cover}')`;
    }

    // Atualiza textos
    document.getElementById("game-name").innerText = data.game;
    document.getElementById("bronze-count").innerText = data.bronze;
    document.getElementById("silver-count").innerText = data.silver;
    document.getElementById("gold-count").innerText = data.gold;
    document.getElementById("platinum-count").innerText = data.platinum;

    animateBar(data.percentage);
    animatePercentage(data.percentage);

    // Glow especial quando 100%
    const fill = document.getElementById("progress-fill");
    if (data.percentage === 100) {
      fill.classList.add("complete");
    } else {
      fill.classList.remove("complete");
    }
  }
};

function animateBar(value) {
  const fill = document.getElementById("progress-fill");
  fill.style.width = value + "%";
}

function animatePercentage(value) {
  const el = document.getElementById("percentage");
  el.innerText = value + "%";
}
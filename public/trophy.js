const popup = document.getElementById("trophy-popup");
const icon = document.getElementById("trophy-icon");
const nameEl = document.getElementById("trophy-name");
const coverEl = document.getElementById("game-cover");
const rarityIcon = document.getElementById("trophy-rarity-icon");
const socket = new WebSocket("ws://localhost:3000");

// Escuta mensagens do servidor
socket.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "NEW_TROPHY") {
    showTrophy(message.data);
  }
};

function showTrophy(trophy) {

  const rarityIcons = {
    bronze: "icons/bronze.png",
    silver: "icons/silver.png",
    gold: "icons/gold.png",
    platinum: "icons/platinum.png"
  };

  const popup = document.createElement("div");
  popup.classList.add("trophy-popup", trophy.type.toLowerCase());

  popup.style.backgroundImage = `url('${trophy.cover}')`;

  popup.innerHTML = `
    <img class="trophy-icon" src="${trophy.icon}" />
    <div class="trophy-info">
      <div class="trophy-name">${trophy.name}</div>
      <img class="trophy-rarity-icon" src="${rarityIcons[trophy.type]}" />
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    popup.classList.add("show");
  }, 50);

  setTimeout(() => {
    popup.classList.remove("show");
    setTimeout(() => popup.remove(), 600);
  }, 5000);
}

setTimeout(() => {
  showTrophy({
    name: "Mestre Lombax",
    type: "platinum",
    icon: "https://i.imgur.com/4AiXzf8.jpeg",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg"
  });

  // segundo troféu para testar múltiplos
  setTimeout(() => {
    showTrophy({
      name: "Explorador Galáctico",
      type: "gold",
      icon: "https://i.imgur.com/4AiXzf8.jpeg",
      cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1tmu.jpg"
    });
  }, 800);

}, 2000);
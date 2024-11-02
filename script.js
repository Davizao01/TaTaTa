const socket = io();
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let players = {};

socket.on('init', (player) => {
    players[player.id] = player;
    updateStats(player);
});

socket.on('updatePlayers', (data) => {
    players = data;
    drawPlayers();
});

document.addEventListener('keydown', (event) => {
    const key = event.key;
    let dx = 0;
    let dy = 0;

    if (key === 'ArrowUp') dy = -5;
    if (key === 'ArrowDown') dy = 5;
    if (key === 'ArrowLeft') dx = -5;
    if (key === 'ArrowRight') dx = 5;

    socket.emit('move', { dx, dy });
});

function updateStats(player) {
    document.getElementById('level').innerText = `Nível: ${player.level}`;
    document.getElementById('coins').innerText = `Moedas: ${player.coins}`;
}

function drawPlayers() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const id in players) {
        const player = players[id];
        ctx.fillStyle = 'blue';
        ctx.fillRect(player.x, player.y, 20, 20);
    }
}

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let items = [];
let arenaPlayers = {};

app.use(express.static('public'));

// Função para gerar loot
function createLoot() {
    const itemTypes = ['Espada', 'Escudo', 'Poção'];
    const newItem = {
        id: Math.random(),
        type: itemTypes[Math.floor(Math.random() * itemTypes.length)],
        x: Math.floor(Math.random() * 20),
        y: Math.floor(Math.random() * 20)
    };
    items.push(newItem);
    io.emit('updateItems', items);
}

// Função para criar jogadores na arena
function createArenaPlayer(id) {
    arenaPlayers[id] = { id: id, health: 100, level: 1 };
}

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

// Quando um jogador se conecta
io.on('connection', (socket) => {
    console.log('Novo jogador conectado: ' + socket.id);
    
    players[socket.id] = { x: 5, y: 5, name: `Jogador ${socket.id}`, health: 100, level: 1, items: [] };
    
    // Envia a lista de jogadores e itens para todos os clientes
    io.emit('updatePlayers', players);
    io.emit('updateItems', items);

    // Quando um jogador se move
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.dx;
            players[socket.id].y += data.dy;
        }
        io.emit('updatePlayers', players);
    });

    // Quando um jogador coleta um item
    socket.on('collectItem', (itemId) => {
        const itemIndex = items.findIndex(item => item.id === itemId);
        if (itemIndex > -1) {
            players[socket.id].items.push(items[itemIndex]);
            items.splice(itemIndex, 1);
            io.emit('updateItems', items);
            io.emit('updatePlayers', players);
        }
    });

    // Arena PvP
    socket.on('joinArena', () => {
        createArenaPlayer(socket.id);
        io.emit('updateArena', arenaPlayers);
    });

    socket.on('attack', (targetId) => {
        if (arenaPlayers[targetId]) {
            arenaPlayers[targetId].health -= 20; // Dano fixo por ataque
            io.emit('updateArena', arenaPlayers);
            if (arenaPlayers[targetId].health <= 0) {
                delete arenaPlayers[targetId]; // Remove jogador derrotado
                io.emit('updateArena', arenaPlayers);
            }
        }
    });

    // Quando um jogador desconecta
    socket.on('disconnect', () => {
        delete players[socket.id];
        delete arenaPlayers[socket.id];
        io.emit('updatePlayers', players);
        io.emit('updateArena', arenaPlayers);
        console.log('Jogador desconectado: ' + socket.id);
    });

    // Gera loot a cada 10 segundos
    setInterval(createLoot, 10000);
});

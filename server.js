const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let items = [];

app.use(express.static('public'));

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

    // Quando um jogador desconecta
    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
        console.log('Jogador desconectado: ' + socket.id);
    });

    // Função para criar itens de loot
    function createLoot() {
        const newItem = {
            id: Math.random(),
            type: 'Espada',
            x: Math.floor(Math.random() * 20),
            y: Math.floor(Math.random() * 20)
        };
        items.push(newItem);
        io.emit('updateItems', items);
    }

    // Gera loot a cada 10 segundos
    setInterval(createLoot, 10000);
});

// Inicia o servidor
server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

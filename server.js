const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log('Novo jogador conectado: ' + socket.id);
    
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 800,
        y: Math.random() * 600,
        level: 1,
        coins: 0
    };

    socket.emit('init', players[socket.id]);

    socket.on('disconnect', () => {
        console.log('Jogador desconectado: ' + socket.id);
        delete players[socket.id];
    });

    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x += data.dx;
            players[socket.id].y += data.dy;
            io.emit('updatePlayers', players);
        }
    });

    socket.on('attack', (targetId) => {
        if (players[targetId]) {
            // Lógica de ataque, exemplo simples
            players[targetId].coins -= 10; // Diminui moedas do alvo
            io.emit('updatePlayers', players);
        }
    });
});

server.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});

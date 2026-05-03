const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);

// WebSockets 100% Active!
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
    let currentRoom = null;

    socket.on('create_room', (data) => {
        currentRoom = data.roomCode;
        socket.join(currentRoom);
    });

    socket.on('join_room', (data) => {
        const room = io.sockets.adapter.rooms.get(data.code);
        if (room && room.size === 1) {
            currentRoom = data.code;
            socket.join(currentRoom);
            io.to(currentRoom).emit('game_start');
        } else {
            socket.emit('room_error', "Room is full or doesn't exist!");
        }
    });

    socket.on('carrom_sync', (data) => {
        socket.to(data.room).emit('carrom_sync', data);
    });

    socket.on('disconnect', () => {
        if (currentRoom) io.to(currentRoom).emit('opponent_disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`CBE Socket Server running on port ${PORT}`));
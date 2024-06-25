const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'NertzBot';

// Run when a client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // socket.emit() broadcasts to that user
        socket.emit('message', formatMessage(botName, 'Welcome to ' + room + '!'));

        // socket.broadcast.emit() broadcasts to all clients in room except that user
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has connected`));

        // Send users and room info
        io.to(user.room).emit('roomusers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    });

    // Listen for team change
    socket.on('changeTeam', team => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('teamChange', {
            user,
            team
        });
    });

    // Listen for chat message
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Run when a client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            // io.emit() broadcasts to all users
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has disconnected`));

            // Send users and room info
            io.to(user.room).emit('roomusers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
        }
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
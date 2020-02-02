const express = require("express");
const socket = require("socket.io");
const game = require("./game.js");

//creating web server
const app = express();
const server = app.listen(80, function () {
    console.log("listening to request on port 80");
});
app.use(express.static("public"));

//setting up socket for webserver
const io = socket(server);

//map to store every room and game object
const map = new Map();

//creates websocket for every user that connects
io.on("connection", function (socket) {
    console.log("socket connection successful " + socket.id);

    socket.on("join", function (room) {
        //if the room doesnt exist
        if (!map.has(room)) {
            map.set(room, game.newGame());
        }
        console.log(map.get(room).full())
        //if the room is full
        if (map.get(room).full()) { console.log("room full"); return }

        socket.join(room);
        socket.room = room;
        console.log(socket.room);
        if (map.get(room).player1 === null) {
            io.to(socket.id).emit("player", "player1");
            socket.player = 1;
            map.get(room).player1 = game.newPlayer(1);
        } else if (map.get(room).player2 === null) {
            io.to(socket.id).emit("player", "player2");
            socket.player = 2;
            map.get(room).player2 = game.newPlayer(2);
        }
        console.log(map);
        socket.on("keycode", function (data) {
            if (data.player === 1) {
                game.keyPress(data.keyCode, map.get(room).player1);
            } else if (data.player === 2) {
                game.keyPress(data.keyCode, map.get(room).player2);
            }
        });
    });

    socket.on("disconnect", function () {
        if(socket.player === 1){
            map.get(socket.room).player1 = null;
        } else if (socket.player === 2){
            map.get(socket.room).player2 = null;
        }
        console.log(socket.room);
        console.log(map);
        if (map.get(socket.room).empty()) {
            map.delete(socket.room);
        }

        console.log(socket.id + " diconnected");
    });
});
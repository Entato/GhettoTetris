const express = require("express");
const socket = require("socket.io");
const game = require("./game.js");
const rooms = require("./room.js");

//creating web server
const app = express();
const server = app.listen(3000, function () {
    console.log("listening to request on port 3000");
});
app.use(express.static("public"));

//setting up socket for webserver
const io = socket(server);

//begins loop and passes websocket to game.js
game.startLoop(io);

//creates websocket for every user that connects
io.on("connection", function (socket) {
    console.log("socket connection successful " + socket.id);

    //sends all every lobby to the client when they connect
    io.to(socket.id).emit("rooms", Array.from(map.keys()));

    socket.on("join", function (roomName) {
        if (!rooms.checkRoom(roomName)){
            const room = new rooms.Room(roomName, socket);
            roomMap.set(room.name, room);
        } else {
            const room = rooms.getRoom(roomName);
            if(!room.connect(socket)){
                io.to(socket.id).emit("error", "roomfull");
            }
        }
    });

    //removes the client from their lobby if they're in one
    socket.on("disconnect", function () {
        if(!socket.room){return}
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

    socket.on("create", function(room){
        if (!rooms.hasRoom(room)) {
            map.set(room, game.newGame());
            new rooms.Room(room, socket).connect(socket);
        } else {
            io.to(socket.id).emit("error", "room already created");
        }
    });

    socket.on("refresh", function(){
        io.to(socket.id).emit("rooms", Array.from(rooms.getMap.keys()));
    });
});
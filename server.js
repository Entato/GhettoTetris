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

game.startLoop(io);

//creates websocket for every user that connects
io.on("connection", function (socket) {
    console.log("socket connection successful " + socket.id);
    io.to(socket.id).emit("rooms", Array.from(map.keys()));

    socket.on("join", function (room) {
        console.log(room);

        //connects to a room if room is full returns false
        if(connect(socket, room)){
            io.to(socket.id).emit("error", "roomfull");
        }
    });

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
        if (!map.has(room)) {
            map.set(room, game.newGame());
            connect(socket, room);
        } else {
            io.to(socket.id).emit("error", "room already created");
        }
    });

    socket.on("refresh", function(){
        io.to(socket.id).emit("rooms", Array.from(map.keys()));
    });
});

//connects the socket to a room
function connect(socket, room){
    console.log("joined");
    //if the room is full
    if (map.get(room).full()) { console.log("room full"); return false}

    socket.join(room);
    socket.room = room;

    //tells the client they successfully connected
    io.to(socket.id).emit("connected", room);

    //fills the player slots of game object
    if (map.get(room).player1 === null) {
        socket.player = 1;
        map.get(room).player1 = game.newPlayer(1, socket.id);
    } else if (map.get(room).player2 === null) {
        socket.player = 2;
        map.get(room).player2 = game.newPlayer(2, socket.id);
    }

    //adds a listener for key presses
    socket.on("keycode", function (data) {
        if (socket.player === 1) {
            game.keyPress(data, map.get(room).player1);
        } else if (socket.player === 2) {
            game.keyPress(data, map.get(room).player2);
        }
    });

    //starts game if the room is full after a player joins
    if (map.get(room).full()) {
        game.init(map.get(room), io);
    }
}
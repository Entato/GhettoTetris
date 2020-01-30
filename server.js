const express = require("express");
const socket = require("socket.io");

//creating web server
const app = express();
const server = app.listen(80, function () {
    console.log("listening to request on port 80");
});
app.use(express.static("public"));

//setting up socket for webserver
const io = socket(server);

const game1 = {
    player1: 0,
    player2: 0,
    nsp: io.of('game1')
};

//creates websocket for every user that connects
io.on("connection", function (socket) {
    console.log("socket connection successful " + socket.id);

    if (game1.player1 == 0) {
        game1.player1 = socket.id;
        io.to(socket.id).emit('player', "player1");
        console.log("added to game1");
    } else if (game1.player2 == 0) {
        game1.player2 = socket.id;
        io.to(socket.id).emit('player', "player2");
        console.log("added to game1");
    }

    if (game1.player1 != 0 && game1.player2 != 0) {
        io.sockets.emit("start", "a");
    }

    socket.on("keycode", function (data) {
        if (data.player === 1) {
            keyPress(data.keyCode, room[0]);
        } else if (data.player === 2) {
            keyPress(data.keyCode, room[1]);
        }
    });

    socket.on("piece", function (data) {
        io.sockets.emit("piece", data);
    })

    socket.on("disconnect", function () {

        if (game1.player1 == socket.id) {
            game1.player1 = 0;
        } else if (game1.player2 == socket.id) {
            game1.player2 = 0;
        }

        //io.sockets.emit("reset", "data");

        console.log(socket.id + " diconnected");
    });
});



//------------------------ will modulize into different files later --------------------------------



function keyPress(keyCode, player) {
    if (keyCode === 37) {
        playerMove(-1, player);
    } else if (keyCode === 39) {
        playerMove(1, player);
    } else if (keyCode === 40) {
        drop(player);
    } else if (keyCode === 38) {
        playerRotate(1, player);
    } else if (keyCode === 32) {
        while (!collide(player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(player);
        reset(player);
        clear(player);
    }
}

//initialise arenas
const arena = [];
for (let i = 0; i < 20; i++) {
    arena.push(new Array(10).fill(0));
}
const arena2 = [];
for (let i = 0; i < 20; i++) {
    arena2.push(new Array(10).fill(0));
}

//player objects for storing game information
const player = {
    pos: { x: 5, y: 0 },
    matrix: null,
    score: 0,
    arena: arena,
    context: context,
    number: 1
}
const player2 = {
    pos: { x: 5, y: 0 },
    matrix: null,
    score: 0,
    arena: arena2,
    context: context2,
    number: 2
}
const room = [];
room.push(player, player2);

//moves the player tetromino down
function drop(player) {
    player.pos.y++;
    if (collide(player)) {
        player.pos.y--;
        merge(player);
        reset(player);
        clear(player);
    }
}

//checks if a piece collides with another
function collide(player) {
    const matrix = player.matrix;
    const position = player.pos;

    for (let i = 0; i < matrix.length; i++) {
        for (let j = 0; j < matrix[i].length; j++) {
            if (matrix[i][j] == 0) continue;
            if (i + position.y >= 20) return true;
            if (player.arena[i + position.y] && player.arena[i + position.y][j + position.x] !== 0) {
                return true;
            }
        }
    }

    return false;
}

//adds the tetromino to the arena
function merge(player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                player.arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

//clears a row if its full
function clear(player) {
    let rowCount = 1;
    outer: for (let i = player.arena.length - 1; i > 0; i--) {
        //checks if row has a empty slot
        for (let j = 0; j < player.arena[i].length; j++) {
            if (player.arena[i][j] === 0) {
                continue outer;
            }
        }

        //removes the row
        const row = player.arena.splice(i, 1)[0].fill(0);
        player.arena.unshift(row);
        i++;

        player.score += rowCount * 10;
        rowCount *= 2;
    }
}

//resets after a teromino is placed
function reset(player) {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (player.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(player)) {
        player.arena.forEach(row => row.fill(0));
    }
}

function playerMove(offset, player) {
    player.pos.x += offset;
    if (collide(player)) {
        player.pos.x -= offset;
    }
}

function playerRotate(dir, player) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }

    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

const colors = [
    null,
    //I tetromino
    '#FF0D72',
    //L tetromino
    '#0DC2FF',
    //J tetromino
    '#0DFF72',
    //O tetromino
    '#F538FF',
    //Z tetromino
    '#FF8E0D',
    //S tetromino
    '#FFE138',
    //T tetromino
    '#3877FF',
];

function createPiece(type) {
    switch (type) {
        case "I":
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0]
            ];
        case "L":
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2]
            ];
        case "J":
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0]
            ];
        case "O":
            return [
                [4, 4],
                [4, 4]
            ];
        case "Z":
            return [
                [5, 5, 0],
                [0, 5, 5],
                [0, 0, 0]
            ];
        case "S":
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0]
            ];
        case "T":
            return [
                [0, 7, 0],
                [7, 7, 7],
                [0, 0, 0]
            ];
    }
}

//calls gameLoop 60 times a second
const tickLengthMs = 1000 / 60;
let previousTick = Date.now();
let actualTicks = 0;
function gameLoop() {
    var now = Date.now();

    actualTicks++
    if (previousTick + tickLengthMs <= now) {
        update(previousTick);
        previousTick = now;

        actualTicks = 0;
    }

    if (Date.now() - previousTick < tickLengthMs - 16) {
        setTimeout(gameLoop);
    } else {
        setImmediate(gameLoop);
    }
}

//drops the piece every second
let counter = 0;
let lastTime = Date.now();
function update(time) {
    const deltaTime = time - lastTime;
    lastTime = time;

    counter += deltaTime;

    //triggers every second
    if (counter >= 1000) {
        drop(player);
        drop(player2);
        counter = 0;
    }
}
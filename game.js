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

//function for rotating a tetromino
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

//function to create a loop for every game
function loop(player, player2) {
    //calls gameLoop 60 times a second
    const gameTickLength = 1000 / 60;
    const sendTickLength = 1000 / 10;
    let gameTick = Date.now();
    let sendTick = Date.now();

    function gameLoop() {
        let now = Date.now();

        if (sendTick + sendTickLength <= now) {
            //sends the state of the game to all players
            io.sockets.emit("gameState", {
                arena1: player.arena,
                arena2: player2.arena,
                matrix1: player.matrix,
                matrix2: player2.matrix,
                position1: player.pos,
                position2: player2.pos,
            });

            sendTick = now;
        }

        if (gameTick + gameTickLength <= now) {
            //updates the game
            update(gameTick);

            gameTick = now;
        }

        if (Date.now() - gameTick < gameTickLength - 16) {
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
    gameLoop();
}

module.exports.init = function (game) {
    reset(game.player1);
    reset(game.player2);
    loop(game.player1, game.player2);
}

module.exports.newGame = function (io, room) {
    return {
        player1: null,
        player2: null,
        io: io,
        room: room,
        full: function(){
            if (this.player1 === null || this.player2 === null){
                return false;
            }
            return true;
        },
        empty: function(){
            if (this.player1 === null && this.player2 === null){
                return true;
            }
            return false;
        }
    }
}

module.exports.newPlayer = function(player){
    const arena = [];
    for (let i = 0; i < 20; i++) {
        arena.push(new Array(10).fill(0));
    }

    return {
        pos: { x: 0, y: 0 },
        matrix: null,
        score: 0,
        arena: arena,
        number: player,
        websocket: ""
    }
}

module.exports.keyPress = function (keyCode, player) {
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
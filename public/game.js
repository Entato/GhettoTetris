//refrencing canvas' in html
const canvas = document.getElementById("player1");
const canvas2 = document.getElementById("player2");
const context = canvas.getContext("2d");
const context2 = canvas2.getContext("2d");

let started = false;
//scaled so canvas is a 10 x 20 grid
context.scale(canvas.width / 10, canvas.height / 20);
context2.scale(canvas2.width / 10, canvas2.height / 20);

//initialise arenas
const arena = [];
for (let i = 0; i < 20; i++) {
    arena.push(new Array(10).fill(0));
}
const arena2 = [];
for (let i = 0; i < 20; i++) {
    arena2.push(new Array(10).fill(0));
}

//object for storing player information
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

//gameloop
let counter = 0;
let lastTime = 0;
function loop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    counter += deltaTime;

    //triggers every second
    if (counter >= 1000) {
        drop(player);
        drop(player2);
        counter = 0;
    }

    draw(player);
    draw(player2);

    requestAnimationFrame(loop);
}

function draw(player) {
    const context = player.context;
    //cleans and redraws the canvas every frame
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(player.arena, { x: 0, y: 0 }, player.context);
    drawMatrix(player.matrix, player.pos, player.context);

    //draws grid
    context.scale(10 / canvas.width, 20 / canvas.height);
    context.fillStyle = '#444';
    for (let i = 0; i < canvas.width; i++) {
        for (let j = 0; j < canvas.height; j++) {
            if (i % (canvas.width / 10) == 0 || j % (canvas.height / 20) == 0) {
                context.fillRect(i, j, 1, 1);
            }
        }
    }
    context.scale(canvas.width / 10, canvas.height / 20);
}

//draws onto canvas given a 2d array
function drawMatrix(matrix, offset, context) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

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
    socket.emit("piece", {
        player: player.number,
        piece: createPiece(pieces[pieces.length * Math.random() | 0])
    });
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

//event listener
document.addEventListener('keydown', event => {
    if (user == 1) {
        socket.emit("keycode1", event.keyCode);
    } else if (user == 2) {
        socket.emit("keycode2", event.keyCode);
    }
});

socket.on("piece", function (data) {
    if (data.player == 1) {
        console.log("recieved piece1")
        player.matrix = data.piece;
        player.pos.y = 0;
        player.pos.x = (player.arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

        if (collide(player)) {
            player.arena.forEach(row => row.fill(0));
        }
    } else if (data.player == 2) {
        console.log("recieved piece2");
        player2.matrix = data.piece;
        player2.pos.y = 0;
        player2.pos.x = (player2.arena[0].length / 2 | 0) - (player2.matrix[0].length / 2 | 0);

        if (collide(player2)) {
            player2.arena.forEach(row => row.fill(0));
        }
        if (!started) {
            loop();
            started = true;
        }
    }


});

socket.on("keycode1", function (data) {
    if (data === 37) {
        playerMove(-1, player);
    } else if (data === 39) {
        playerMove(1, player);
    } else if (data === 40) {
        drop(player);
    } else if (data === 38) {
        playerRotate(1, player);
    } else if (data === 32) {
        while (!collide(player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(player);
        reset(player);
        clear(player);
    }
});

socket.on("keycode2", function (data) {
    if (data === 37) {
        playerMove(-1, player2);
    } else if (data === 39) {
        playerMove(1, player2);
    } else if (data === 40) {
        drop(player2);
    } else if (data === 38) {
        playerRotate(1, player2);
    } else if (data === 32) {
        while (!collide(player2)) {
            player2.pos.y++;
        }
        player2.pos.y--;
        merge(player2);
        reset(player2);
        clear(player2);
    }
});

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

function init() {
    reset(player);
    reset(player2);
}
/*
function reset() {
    arena = [];
    for (let i = 0; i < 20; i++) {
        arena.push(new Array(10).fill(0));
    }
    arena2 = [];
    for (let i = 0; i < 20; i++) {
        arena2.push(new Array(10).fill(0));
    }
    player = {
        pos: { x: 5, y: 0 },
        matrix: null,
        score: 0,
        arena: arena,
        context: context,
        number: 1
    }
    player2 = {
        pos: { x: 5, y: 0 },
        matrix: null,
        score: 0,
        arena: arena2,
        context: context2,
        number: 2
    }
}
*/
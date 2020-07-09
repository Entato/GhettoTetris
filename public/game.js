//refrencing canvas' in html
const canvas = document.getElementById("player1");
const canvas2 = document.getElementById("player2");
const context = canvas.getContext("2d");
const context2 = canvas2.getContext("2d");

//scaled so canvas is a 10 x 20 grid
context.scale(canvas.width / 10, canvas.height / 20);
context2.scale(canvas2.width / 10, canvas2.height / 20);

function draw(arena, matrix, position, context) {
    //cleans and redraws the canvas every frame
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 }, context);
    drawMatrix(matrix, position, context);

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

//event listener
document.addEventListener('keydown', event => {
    socket.emit("keycode", event.keyCode);
});

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");
socket.on("gameState", function(data){
    draw(data.arena1, data.matrix1, data.position1, context);
    const player1Score = document.createElement("p").appendChild(document.createTextNode(data.score1));
    clearDiv(score1);
    score1.appendChild(player1Score);

    draw(data.arena2, data.matrix2, data.position2, context2);
    const player2Score = document.createElement("p").appendChild(document.createTextNode(data.score2));
    clearDiv(score2);
    score2.appendChild(player2Score);
});

const colors = [
    null,
    //I tetromino
    '#00FFFF',
    //L tetromino
    '#FF8C00',
    //J tetromino
    '#0000ff',
    //O tetromino
    '#FFFF00',
    //Z tetromino
    '#FF0000',
    //S tetromino
    '#008000',
    //T tetromino
    '#9400D3',
];
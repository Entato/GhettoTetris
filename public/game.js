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

socket.on("gameState", function(data){
    draw(data.arena1, data.matrix1, data.position1, context);
    draw(data.arena2, data.matrix2, data.position2, context2);
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

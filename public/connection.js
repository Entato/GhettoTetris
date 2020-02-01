//connects to server
const socket = io.connect("localhost:80");

let user = 0;

socket.on("player", function(data){
    console.log("recieved");
    if (data == "player1"){
        user = 1;
    } else if (data == "player2"){
        user = 2;
    }
});

const button = document.getElementById("join");
button.addEventListener("click", function(){
    socket.emit("join", "room1");
})
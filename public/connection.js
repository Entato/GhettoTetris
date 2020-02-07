//connects to server
const socket = io.connect("localhost:80");

//refrencing html elements
const body = document.getElementById("body");
const gameDiv = document.getElementById("game");
const statusDiv = document.getElementById("status");
const lobbyDiv = document.getElementById("lobby");

const createButton = document.getElementById("create");
const refreshButton = document.getElementById("refresh");

createButton.addEventListener("click", function(){
    const div = document.createElement("div");
    const roomName = document.createElement("input");
    const createRoom = document.createElement("button");

    roomName.setAttribute("type", "text");
    createRoom.appendChild(document.createTextNode("create"));
    createRoom.addEventListener("click", function(){
        socket.emit("create", roomName.value);
        clearDiv(lobbyDiv);
        div.remove();
    });

    div.appendChild(roomName);
    div.appendChild(createRoom);

    document.getElementById("body").appendChild(div);
});

refreshButton.addEventListener("click", function(){
    socket.emit("refresh");
});

socket.on("rooms", function(data){
    const roomDiv = document.getElementById("rooms");

    //clears the div of all rooms before adding new ones
    clearDiv(roomDiv);

    //creates a button for every game lobby on the server
    data.forEach(element => {
        const room = document.createElement("button");
        room.appendChild(document.createTextNode(element));
        room.addEventListener("click", function(){
            console.log(room.childNodes[0].nodeValue);
            socket.emit("join", room.childNodes[0].nodeValue);

            /*
            const leaveButton = document.createElement("button");
            leaveButton.appendChild(document.createTextNode("leave"));
            leaveButton.addEventListener("click", function(){

            });

            document.getElementById("body").append(leaveButton);
            */
           clearDiv(lobbyDiv);
        });
        roomDiv.appendChild(room);
    });
});

socket.on("connected", function(data){
    //shows which room the client joined
    const header = document.createElement("h1");
    const text = document.createTextNode("Joined " + data);
    header.appendChild(text);
    statusDiv.appendChild(header);

    //clears the available lobbies div
    clearDiv(lobbyDiv);
});

//clears a div
function clearDiv(div){
    while(div.firstChild){
        div.removeChild(div.firstChild);
    }
}
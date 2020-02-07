//connects to server
const socket = io.connect("localhost:80");

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
        document.getElementById("lobby").remove();
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
    while(roomDiv.firstChild){
        roomDiv.removeChild(roomDiv.firstChild);
    }

    //creates a button for every game lobby on the server
    data.forEach(element => {
        const room = document.createElement("button");
        room.appendChild(document.createTextNode(element));
        room.addEventListener("click", function(){
            console.log(room.childNodes[0].nodeValue);
            socket.emit("join", room.childNodes[0].nodeValue);
            document.getElementById("lobby").remove();

            const header = document.createElement("h1");
            const text = document.createTextNode("Joined " + room.childNodes[0].nodeValue);
            header.appendChild(text);

            const leaveButton = document.createElement("button");
            leaveButton.appendChild(document.createTextNode("leave"));
            leaveButton.addEventListener("click", function(){

            });

            document.getElementById("body").append(header);
            document.getElementById("body").append(leaveButton);
        });
        roomDiv.appendChild(room);
    });
});

socket.on("connected", function(data){
    
});
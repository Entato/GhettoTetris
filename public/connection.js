//connects to server
const socket = io.connect("localhost:80");

let user = 0;

const createButton = document.getElementById("create");
const leaveButton = document.getElementById("leave");

createButton.addEventListener("click", function(){
    const div = document.createElement("div");
    const roomName = document.createElement("input");
    const createRoom = document.createElement("button");

    roomName.setAttribute("type", "text");
    createRoom.appendChild(document.createTextNode("create"));
    createRoom.addEventListener("click", function(){
        socket.emit("create", roomName.value);
        div.remove();
    });

    div.appendChild(roomName);
    div.appendChild(createRoom);

    document.getElementById("body").appendChild(div);
});


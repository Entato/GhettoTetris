//map to store every room and game object
const roomMap = new Map();

class Room {
    player1 = null;
    player2 = null;

    constructor(name, hostsocket){
        this.name = name;
        this.player1 = hostsocket;
        roomMap.set(name, this);
    }

    connect(socket){
        if(!this.player1){
            this.player1 = socket;
        } else if (!this.player2){
            this.player2 = socket;
        } else {
            return false;
        }

        if (this.player1 && this.player2) return true;

        socket.on("disconnect", function(){
            console.log(socket.id + " diconnected");
            if (checkPlayer(socket) == 1){
                this.player1 = null;
            } else if (checkPlayer(socket) == 2){
                this.player2 = null;
            }
        })
    }

    checkPlayer(socket){
        if(this.player1 == socket){
            return 1;
        } else if (this.player2 == socket){
            return 2;
        } else {
            return 0;
        }
    }
}

function getMap(){
    return roomMap;
}

function getRoom(roomName){
    return roomMap.get(roomName);
}

function hasRoom(roomName){
    return roomMap.has(roomName) ? true : false;
}
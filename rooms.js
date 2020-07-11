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

        socket.on("keycode", function(data){
            if (socket.id == player1.id){

            } else if (socket.id == player2.id){

            }
        })

        socket.on("disconnect", function(){
            console.log(socket.id + " diconnected");
            if (checkPlayer(socket) == 1){
                this.player1 = null;
            } else if (checkPlayer(socket) == 2){
                this.player2 = null;
            }

            if (checkEmpty){
                roomMap.delete(this.name);
            }
        })
    }

    checkPlayer(socket){
        return this.player1 == socket ? 1 : this.player2 == socket ? 2 : 0;
    }

    checkEmpty(){
        return this.player1 ? false : this.player2 ? false : true;
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
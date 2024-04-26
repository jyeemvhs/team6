//const Session = require('./session');
const Room = require('./room');

let RoomManager = function(sm) {
    this.rooms = Array(0);
    this.sManager = sm;
}

RoomManager.prototype.createRoom = function(session, rname, maxUsers, rpass=null) {
    if (session == null) return null;
    for (let i = 0; i < this.rooms.length; i++) {
        let s = this.rooms[i];
        if (!s) continue;

        if (s.name() == rname) return null;
        //TODO: check if name conflicts or smthin 
    }

    let newRoom = new Room(session, this.uniqueId(), rname, maxUsers, rpass);
    newRoom.add(session, rpass);

    for (let i = 0; i < this.rooms.length; i++) {
        if (this.rooms[i]) continue; 

        this.rooms[i] = newRoom;
        return newRoom;
    }

    this.rooms.push(newRoom);
    return newRoom;
}

RoomManager.prototype.joinRoom = function(roomId,sessionToken,password) {
    let index = this.rooms.findIndex((e) => e.id() == roomId);
    if (index == -1) return false;

    let room = this.rooms[i];
    
    let session = this.sManager.getSession(sessionToken);
    if (session == null) return false;

    let res = room.add(session, password);
    if (!res) return false;
    
    setTimeout(function() {
        if (room.hasJoined(session)) return;
        room.remove(sessionToken);

        // broadcast ?
    }, 10000);
    return true;
}

RoomManager.prototype.roomExists = function(roomId) {
    return this.getRoom(roomId) != null;
}

RoomManager.prototype.getRoom = function(roomId) {
    if (!roomId) return false;

    for (let r of this.rooms) {
        if (!r) continue;
        if (r.id() == roomId) return r;
    }

    return null;
}

RoomManager.prototype.list = function() {
    let arr = Array(0);

    for (let r of this.rooms) {
        if (!r) continue;
        
        arr.push(r.toJSON());
    }

    return arr;
}










RoomManager.prototype.uniqueId = function() {
    let currGen;

    while (true) {
        currGen = this.genId();

        for (let s of this.rooms) {
            if (s.id() == currGen) {
                currGen = null;
                break;
            }   
        }

        if (currGen != null) break;
    }

    return currGen;
}

RoomManager.prototype.genId = function() {
    let id = "";

    for (let i = 0; i < 10; i++) {
        id += String.fromCharCode(Math.floor(Math.random() == 1 ? 
            ((Math.random() * 26) + 0x41) : 
            (Math.random() * 10) + 48)
        );
    }

    return id;
}

module.exports = RoomManager;

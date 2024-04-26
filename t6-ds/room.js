let Room = function(row, roomId, name, max, pass=null) {
    this.users = Array(max);
    this.sockets = Array(max);
    this.maxUsers = max;
    this.roomName = name;
    this.password = pass;
    this.rid = roomId;
    this.owner = row;
    this.roomStarted = false;
}

Room.prototype.add = function(session, pass=null) {
    if (this.roomStarted) return false;
    if ((typeof session) != "object") return false;

    if (this.count() >= this.maxUsers) return false;
    if (this.hasPassword()) {
        if (!pass) return false;
        if (this.password != pass) return false;
    }

    for (let i = 0; i < this.maxUsers; i++) {
        let s = this.users[i];
        if (s) continue;

        this.users[i] = session;
        return true;
    }

    return false;
}

Room.prototype.hasJoined = function(session) {
    for (let i = 0; i < this.maxUsers; i++) {
        let s = this.users[i];
        if (!s) continue;

        // token match AND we have a valid socket instance
        if (s.token() == session.token() && this.sockets[i]) return true;
    }

    return false;
}

Room.prototype.markJoin = function(socket) {
    for (let i = 0; i < this.maxUsers; i++) {
        let s = this.users[i];
        if (!s) continue;

        if (s.token() != socket.token) continue;
        if (this.sockets[i]) return false;

        this.sockets[i] = socket;

        return true;
    }

    return false;
}

Room.prototype.start = function() {
    if (this.roomStarted) return false;
    this.roomStarted = true;

    return true;
}

Room.prototype.started = function() {
    return this.roomStarted;
}

Room.prototype.isOwner = function(session) {
    return this.owner.token() == session.token();
}

Room.prototype.hasPassword = function() {
    return this.password != null;
}

Room.prototype.password = function() {
    return this.password;
}

Room.prototype.name = function() {
    return this.roomName;
}

Room.prototype.id = function() {
    return this.rid;
}

Room.prototype.count = function() {
    let c = 0;
    for (let i = 0; i < this.maxUsers; i++) {
        let user = this.users[i];
        if (user) c++;
    }

    return c;
}

Room.prototype.countConnected = function() {
    let c = 0;
    for (let i = 0; i < this.maxUsers; i++) {
        if (this.users[i] && this.sockets[i]) c++;
    }

    return c;
}

Room.prototype.remove = function(token) {
    for (let i = 0; i < this.maxUsers; i++) {
        let s = this.users[i];
        if (!s) continue;

        if (s.token() != token) continue;

        this.users[i] = null;
        return true;
    }

    return false;
}

Room.prototype.toJSON = function() {
    return { id: this.rid, name: this.roomName, total: this.count(), max: this.maxUsers, hasPass: this.hasPassword() };
}

module.exports = Room;
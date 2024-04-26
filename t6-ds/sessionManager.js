const Session = require('./session');
const User = require('./user');

let SessionManager = function() {
    this.sessions = Array(0);
}

SessionManager.prototype.createSession = function(username) {
    for (let i = 0; i < this.sessions.length; i++) {
        let s = this.sessions[i];
        if (!s) continue;

        if (s.usernameMatch(username)) {
            s.token(this.uniqueToken());

            return new Session(s.username(), s.token());
        }   
    }

    newS = new Session(username, this.uniqueToken());

    for (let i = 0; i < this.sessions.length; i++) {
        if (this.sessions[i]) continue; 

        this.sessions[i] = newS;
        return new Session(username, newS.token());
    }

    this.sessions.push(newS);
    return new Session(username, newS.token());
}

SessionManager.prototype.destroySession = function(username) {
    let index = this.sessions.findIndex((e) => e.username() == username);
    if (index == -1) return;

    let temp = this.sessions[i];
    this.sessions[i] = null;
    return temp;
}

SessionManager.prototype.uniqueToken = function() {
    let currGen;

    while (true) {
        currGen = this.genToken();

        for (let s of this.sessions) {
            if (s.tokenMatch(currGen)) {
                currGen = null;
                break;
            }   
        }

        if (currGen != null) break;
    }

    return currGen;
}

SessionManager.prototype.genToken = function() {
    let token = "";

    for (let i = 0; i < 25; i++) {
        token += String.fromCharCode(Math.floor((Math.random() * 26) + 0x41));
    }

    return token;
}


SessionManager.prototype.checkSession = function(token) {
    if (!token) return false;

    for (let s of this.sessions) {
        if (!s) continue;
        
        if (s.tokenMatch(token)) return true;
    }

    return false;
}

SessionManager.prototype.getSession = function(token) {
    if (!token) return false;

    for (let s of this.sessions) {
        if (!s) continue;
        if (s.tokenMatch(token)) return new Session(s.username(), token);
    }

    return null;
}

module.exports = SessionManager;

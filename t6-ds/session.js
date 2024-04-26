let Session = function(u,t) {
    this.user = u;
    this.tok = t;
}

Session.prototype.username = function() {
    return this.user;
}

Session.prototype.token = function(newToken=null) {
    if (newToken != null) {
        let oldTok = this.tok;
        this.tok = newToken;
        return oldTok;
    }
    
    return this.tok;
}

Session.prototype.usernameMatch = function(u) {
    return this.user == u;
}

Session.prototype.tokenMatch = function(t) {
    return this.tok == t;
}

module.exports = Session;
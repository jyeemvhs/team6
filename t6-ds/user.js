let User = function(user,pass,type) {
    this.u = user;
    this.p = pass;
    this.t = type;  
}

User.prototype.username = function() {
  return this.u;
}

User.prototype.password = function() {
  return this.p;
}

User.prototype.accountType = function() {
  return this.t;
}

User.prototype.equals = function(other) {
  return this.u == other.u && this.p == other.p;
}


module.exports = User;
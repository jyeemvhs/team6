
const User = require('./user');
const AccountType = require('./accountType');

let Database = function() {
    this.data = [];
}

let index = 0;
Database.prototype.displayUsers = function() {
    for (let i=0;i<this.data.length;i++) {
        console.log(this.data[i]);
    }
}

Database.prototype.createUser = function(user,pass) {
  this.data[index++] = new User(user,pass,AccountType.USER);
  return true;
}

Database.prototype.getUser = function(username) {
  for (let i=0;i<this.data.length;i++) {
    if (this.data[i] && this.data[i].username() == username) {
      let d = this.data[i];
      return new User(d.username(), d.password(), d.accountType());
    }
  }

  return null;
}

Database.prototype.usernameAlreadyExists = function(username) {
  for (let i=0;i<this.data.length;i++) {
    if (this.data[i] && this.data[i].username() == username) return true;
  }

  return false;
}

Database.prototype.login = function(username,pass) {
  let user = this.getUser(username);
  if (user.password() != pass) return null;

  return user;
}

module.exports = Database;

 
// group 6

let express = require('express');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');
//const path = require("path");

//const User = require("./user.js");

const Words = require("./words.js");
Words.loadWords();

const Database = require("./database.js");
const database = new Database();

database.createUser("admin","cGFzc3dvcmQ=");

const SessionManager = require("./sessionManager.js");
const sManager = new SessionManager();

const RoomManager = require("./roomManager.js");
const rManager = new RoomManager(sManager);

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(require("./routes.js"));

function hasReqUserPass(res,u,p) {
  if (Words.checkEmpty(u) || Words.checkEmpty(p)) {
    res.status(400);
    res.json({message: "Please provide a username and password!"});
    return false;
  }

  return true;
}

app.post("/new-user", function(req,res) {
  let user = req.body.u;
  let pass = req.body.p;

  if (!hasReqUserPass(res,user,pass)) return;

  if (database.usernameAlreadyExists(user)) {
    res.status(409)
    res.json({message: "Username already exists"});
    return;
  }

  database.createUser(user,pass);
  res.status(201);
  res.json({message: "Account Created Successfully!"});
});

app.post("/login", function(req,res) {
  let user = req.body.u;
  let pass = req.body.p;
  if (!hasReqUserPass(res,user,pass)) return;

  if (!database.usernameAlreadyExists(user)) {
    res.status(404).json({message: "User doesn't exist!"});
    return;
  }

  let account = database.login(user,pass);
  if (account == null) {
    res.status(401).json({message: "Incorrect password!"});
    return;
  }
  
  let session = sManager.createSession(user);

  res.json({message: "Login Successful!", username: user, token: session.token()});
});

app.get("/check-session", function(req,res) {
  let t = req.get("token");

  if (!sManager.checkSession(t)) {
    res.status(401);
    res.end("401 Unauthorized");
    return;
  }

  res.status(204).end();
});

// ============================================================================================================================================================
// handles auth, invalid session cannot get anything below this
// ============================================================================================================================================================
app.use(function(req,res,next) {
  let t = req.get("token");

  if (!sManager.checkSession(t)) {
    res.status(401);
    res.json("{}");
    return;
  }

  next();
});

app.get("/lobbies", function(req,res) {
  res.json(rManager.list());
});

app.get("/join", function(req,res) {
  let id = req.query.roomId;
  let room = rManager.getRoom(id);
  if (!room) {
    res.status(404).json({});
    return;
  }

  let session = sManager.getSession(req.get("token"));
  if (!session) {
    res.status(401).json({});
    return;
  }

  //let val = ;
  if (room.add(session)) res.json({c:true});
  else res.json({c:false});
});

app.post("/create-lobby", function(req,res) {
  // tell client to join right after success create
  let roomName = req.body.name;
  let max = parseInt(req.body.max);
  let pass = req.body.pass;

  if (Words.checkEmpty(roomName)) {
    res.status(400).json("400 Bad Request - Invalid room name given");
    return;
  }

  if (Words.checkEmpty(pass)) pass = null;

  if (isNaN(max) || max < 3 || max > 32) {
    res.status(400).json("400 Bad Request - Invalid or out of range room size");
    return;
  }

  let session = sManager.getSession(req.get("token"));
  if (session == null) {
    res.status(400).json("400 Bad Request - Invalid Session");
    return;
  }

  let newRoom = rManager.createRoom(session, roomName, max, pass); 
  if (newRoom == null) {
    res.status(400).json("400 Bad Request - ??");
    return;
  }
  
  //TODO: tell client to visit canvas with the new room id we just created
  res.json({id:newRoom.id()});
});












let http = require('http');
let server = http.createServer(app);
let io = new Server(server);

/*
things we'll need

private rooms
keep track of games
word list

modes:
1 drawing and 3 mins to draw it w/random prompt
1 drawing, 90 seconds to draw it and then the drawings are randomly sent to other people and they get 2 min to expand on it

*/

//io.engine.on("")

io.on('connection', function(socket) {
  let token = socket.handshake.headers.token;

  if (!sManager.checkSession(token)) {
    socket.disconnect(true);
    console.log("session invalid");
    console.log(token);
    return;
  }

  let roomId = socket.handshake.query.roomId;
  let room = rManager.getRoom(roomId);
  if (!room) {
    socket.disconnect(true);
    console.log("room invalid");
    console.log(room);
    return;
  }

  room.markJoin(socket);
  socket.join(roomId);

  socket.cSession = sManager.getSession(token);
  io.to(roomId).emit('status', "update", socket.cSession.username() + " has joined");
  socket.cRoom = room;
  socket.token = token;
  

  socket.on('start-game', function() {
    if (!room.isOwner(socket.cSession)) return;

    // make sure we have req members

    //if (room.count() < 3) return;
    //if (room.countConnected() < 3) return;
    if (!room.start()) return;

    io.to(roomId).emit('start-timer', 3, "Game Starting...");

    setTimeout(() => {
      io.to(roomId).emit('start-timer', 90, Words.randomWord());
    }, 3000);
  });


  //socket.emit("start-timer", 90, Words.randomWord());

  socket.on("disconnect", (reason) => {
    io.to(roomId).emit('status', "error", socket.cSession.username() + " has left");
    room.remove(token);
  });

  socket.on('drawing', function(b64) {
    console.log("recieved drawing from client");
    

    //socket.broadcast.emit("update-canvas", b64 == null, b64);
  });

  socket.on('chat', function(message) {
    if (!message || message.trim().length == 0) return;
    if (message.length > 256) message = message.substr(0, 256);

    io.to(roomId).emit('message', socket.cSession.username(), message);
    //io.emit('status', "update", randomWord());
    //io.emit('status', "error", randomWord());
    //socket.emit("start-timer", 90, randomWord());
  })
});

let port = process.env.PORT || 3006;
server.listen(port);
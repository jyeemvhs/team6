let path = require("path");
let express = require("express");
let router = express.Router();

router.use('/img', express.static("./public/image"));
router.use('/css', express.static("./public/css"));
router.use('/svg', express.static("./public/svg"));
router.use('/js', express.static("./public/js"));

router.get('/', function(req,res) {
  res.sendFile(path.resolve("./public/index.html"));
});

router.get('/icon', function(req,res) {
  res.sendFile(path.resolve("./public/icon.png"));
});


router.get('/home', function(req,res) {
  res.sendFile(path.resolve("./public/home.html"));
});

router.get('/canvas', function(req,res) {
  let id = req.query.roomId;
  if (id == null || id == "") {
    res.status(307).set("Location", "/home").end();
    return;
  }

  res.sendFile(path.resolve("./public/canvas.html"));
});

router.get('/gallery', function(req,res) {
  res.sendFile(path.resolve("./public/display.html"));
});
/*
function noToken(req) {
  let token = req.get("token");
  return token == null || (typeof token) != String || token.trim() != "";
}
*/
module.exports = router;
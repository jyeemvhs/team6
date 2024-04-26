import Brush from "./brush.js";
import Color from "./color.js";
import Timer from "./timer.js";

const canvas = $("#drawing")[0];
const aidCanvas = $("#aidDrawing")[0];

function f(){
  return $(this).attr('id') == chatInput;
};

document.onselectstart = f;
document.oncontextmenu = f;
aidCanvas.onselectstart = f;
aidCanvas.oncontextmenu = f;

const ctx = canvas.getContext("2d", { "willReadFrequently": true });
const aidCtx = aidCanvas.getContext("2d");

let shapeFill = false
let currBrush = Brush.STANDARD;
let mouseDown = false;
let shiftDown = false;
let brushSize;
let lastX;
let lastY;
let SInitial = [0,0] // {x:10,y:10}
//let pbcol = new Color(0,0,0);
let filra = []
//let dcol = []

/* do we keep this or what

for (let i = 0; i < this.NUM_ROWS; i++) {
  this.filra[i] = Array(this.NUM_COLUMNS);
}
*/
//console.log(`sx=${SInitial[0]}, sy=${SInitial[1]}, ex=${event.offsetX-SInitial[0]}, ey=${event.offsetY-SInitial[1]}`);

const socket = io({
  extraHeaders: {
    "token": localStorage.getItem("token")
  }, query: {
    "roomId": new URLSearchParams(window.location.search).get("roomId")
  }
});

socket.on('disconnect', function(reason) {
  console.log("conn closed | " + reason);
  //todo idk, prob show error cuz the server closed likely for a reason
})

//if (socket.disconnected) throw new Error("Connection failure");
console.log("not disconnected");

socket.on('start-timer', function(duration, keyword) {
  new Timer(duration);
  $("#keyword").text(keyword);
  ctx.clearRect(0, 0, canvas.width, canvas.height); // always clear on timer start
});

socket.on('update-canvas', function(clearCanvas, data) {
  console.log("updating canvas");

  if (clearCanvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (data == null) return;

  let image = new Image();
  image.onload = function() { 
    ctx.save();

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(image, 0, 0); 
    
    ctx.restore();
  }
  image.src = data;
});

socket.on('message', function(username, message) {
  let a = canAutoScrollChat();

  let p = $("<p></p>").text(`: ${message}`);

  $("<span></span>").addClass("user")
    .text(username)
    .prependTo(p);
  
  $("#messages").append(p);
  if (a) autoScrollChat();
});

socket.on('status', function(type, content) {
  let a = canAutoScrollChat();
  
  let bold = $("<b></b>").text(content);
  let p = $("<p></p>")
    .addClass(type)
    .append(bold);

  $("#messages").append(p);

  if (a) autoScrollChat();
});

$("#startGame").click(function() {
  console.log("starting");
  socket.emit('start-game');
})

function canAutoScrollChat() {
  let m = $("#messages");

  return Math.abs(m.prop("scrollHeight") - m.prop("clientHeight") - m.prop("scrollTop")) <= 1;
}

function autoScrollChat() {
  let m = $("#messages");
  m.prop("scrollTop", m.prop("scrollHeight"));
}

function getColor(color=ctx.fillStyle) {
  //let r = parseInt(color.substr(1, 2), 16);
  //let g = parseInt(color.substr(3, 2), 16);
  //let b = parseInt(color.substr(5, 2), 16);

  return Color.FromHexColor(color);
}

function setColor(color) {
  if (color.startsWith("#")) {
    let c = getColor(color);

    if ((c.red > 175 && c.green > 175) || (c.green > 175 && c.blue > 175)) {
      $(".brushFill").css("background-color", "black");
      $(".brushFill").css("color", "white");
    } else {
      $(".brushFill").css("background-color", "white");
      $(".brushFill").css("color", "black");
    } 
  }

  $("svg").css("fill", color);
  $("line").css("stroke", color);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;

  aidCtx.fillStyle = color;
  aidCtx.strokeStyle = color;
}

function setSize(size) {
  if (isNaN(size) || size < 5 || size > 35) return;

  brushSize = size;

  if (size % 2 != 0) size--;

  ctx.lineWidth = size;
  aidCtx.lineWidth = size;
}

function setOpacity(opacity) {
  if (isNaN(opacity) || opacity > 1 || opacity < 0) return;

  ctx.globalAlpha = opacity;
}

function drawRect(x,y,w,h,c=ctx) {
  if (shiftDown) {
    /*if (w > 0) {
      w = Math.max(w, h);

      if (h > 0) h = w;
      else h = -w;
    } else {
      h = Math.max(w, h);

      if (h > 0) w = -h;
      else w = h;
    }*/
    w=Math.sign(w)*Math.max(Math.abs(w),Math.abs(h))
    h=Math.sign(h)*Math.max(Math.abs(w),Math.abs(h))
  }

  if (shapeFill) c.fillRect(x,y,w,h);
  else c.strokeRect(x,y,w,h);
}

function cObjAr(ra,objj){
  for(let i=0;i<ra.length;i++){
    if(ra[i].x == objj.x && ra[i].y==objj.y){
      return true
    }
  }
  return false
}

async function paintBucket(x,y){
    //console.log("called")
    let pixCol = Color.FromImageData(ctx.getImageData(x,y,1,1)); //{red: ctx.getImageData(x,y,1,1).data[0], green: ctx.getImageData(x,y,1,1).data[1],blue: ctx.getImageData(x,y,1,1).data[2]}
    let ispix = true
    //console.log(pixCol)
    //console.log(x +" " + y)
    //console.log(canvas.width + " wh "+ canvas.height)
    //if(first){
    //  pbcol=pixCol
    //}
    filra.push({x:x,y:y}) 
    let newra=[{x,y}]
    let tempra = []
    while(ispix)
    {
      let pra = tempra 
      tempra = newra
      newra = []
      ispix=false
      //console.log("temp: "+tempra.length)
      for(let i = 0; i<tempra.length; i++){
        x=tempra[i].x
        y=tempra[i].y
        if(x+1>=0&&y>=0&&x+1<canvas.width&&y<canvas.height&&
          (!cObjAr(tempra,{x:x+1,y:y}))&&
          (!cObjAr(pra,{x:x+1,y:y}))&&
          (!cObjAr(newra,{x:x+1,y:y}))&&
          pixCol.equals(Color.FromImageData(ctx.getImageData(x+1,y,1,1)))){
            filra.push({x:x+1,y:y})
            newra.push({x:x+1,y:y})
            ispix = true
            //paintBucket(x+1,y,false)
          }
        if(x>=0&&y+1>=0&&x<canvas.width&&y+1<canvas.height&&
          (!cObjAr(tempra,{x:x,y:y+1}))&&
          (!cObjAr(pra,{x:x,y:y+1}))&&
          (!cObjAr(newra,{x:x,y:y+1}))&&
          pixCol.equals(Color.FromImageData(ctx.getImageData(x,y+1,1,1)))){
            filra.push({x:x,y:y+1})
            newra.push({x:x,y:y+1})
            ispix = true
            //paintBucket(x,y+1,false)
          }
        if(x-1>=0&&y>=0&&x-1<canvas.width&&y<canvas.height&&
          (!cObjAr(tempra,{x:x-1,y:y}))&&
          (!cObjAr(pra,{x:x-1,y:y}))&&
          (!cObjAr(newra,{x:x-1,y:y}))&&
          pixCol.equals(Color.FromImageData(ctx.getImageData(x-1,y,1,1)))){
            filra.push({x:x-1,y:y})
            newra.push({x:x-1,y:y})
            ispix = true
            //paintBucket(x-1,y,false)
          }
          if(x>=0&&y-1>=0&&x<canvas.width&&y-1<canvas.height&&
            (!cObjAr(tempra,{x:x,y:y-1}))&&
            (!cObjAr(pra,{x:x,y:y-1}))&&
            (!cObjAr(newra,{x:x,y:y-1}))&&
            pixCol.equals(Color.FromImageData(ctx.getImageData(x,y-1,1,1)))){
              filra.push({x:x,y:y-1})
              newra.push({x:x,y:y-1})
              ispix = true
              //paintBucket(x,y-1,false)
          }
      }
      //console.log("new: "+newra.length)
    }
    
      
      
}

function drawTree(sx,sy,ex,ey,c=ctx) {
  let w=ex-sx
  let h=ey-sy
  c.beginPath();
  c.moveTo(sx+0.4*w, sy+h);
  c.lineTo(sx+0.6*w, sy+h);
  c.lineTo(sx+0.6*w, sy+0.7*h);
  c.lineTo(sx+0.7*w, sy+0.9*h);
  c.lineTo(sx+0.6*w, sy+0.5*h);
  c.lineTo(sx+0.8*w, sy+0.7*h);
  c.lineTo(sx+0.7*w, sy+0.4*h);
  c.lineTo(sx+0.9*w, sy+0.5*h);
  c.lineTo(sx+0.5*w, sy);
  c.lineTo(sx+0.1*w, sy+0.5*h);
  c.lineTo(sx+0.3*w, sy+0.4*h);
  c.lineTo(sx+0.2*w, sy+0.7*h);
  c.lineTo(sx+0.4*w, sy+0.5*h);
  c.lineTo(sx+0.3*w, sy+0.9*h);
  c.lineTo(sx+0.4*w, sy+0.7*h);
  c.lineTo(sx+0.4*w, sy+h);
  
  if (shapeFill) c.fill();
  else c.stroke();
}

function drawLine(sx,sy,ex,ey,c=ctx) {
  c.beginPath();
  c.moveTo(sx, sy);
  c.lineTo(ex, ey);
  c.stroke();
}

function drawEllipse(sx,sy,ex,ey,c=ctx) {
  c.beginPath();
  c.ellipse(sx+(ex-sx)/2,sy+(ey-sy)/2,Math.abs((ex-sx)/2),Math.abs((ey-sy)/2),0,0,2*Math.PI);

  if (shapeFill) c.fill();
  else c.stroke();
}

setColor("black");
setOpacity(1);
setSize(15);

$("#colorSelect").change(function() {
  setColor($(this).val());
});

$("#bgColor").change(function() {
  $("#drawing").css("background-color", $(this).val());
});

$("#bSize").change(function() {
  setSize($(this).val());
});

$("#opacity").change(function() { 
  setOpacity($(this).val());
});

$("#toggleFill").change(function(e) {
  shapeFill = !shapeFill
})

$("#standard").click(function() { 
  currBrush = Brush.STANDARD; 
  ctx.globalCompositeOperation = "source-over";

  Brush.disableButton(currBrush);
});

$("#eraser").click(function() { 
  currBrush = Brush.ERASER;
  ctx.globalCompositeOperation = "destination-out";

  Brush.disableButton(currBrush);
});

// handles all buttons
$(".drawButton").click(function() {
  currBrush = Brush.brushFromId($(this).attr('id'));
  ctx.globalCompositeOperation = "source-over";
  Brush.disableButton(currBrush);
});

$("#clear").click(function() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  socket.emit("drawing", null);
});

function sendChat() {
  let input = $("#chatInput");

  socket.emit('chat', input.val());
  input.val("");
}

$("#chatInput").keypress(function(e) {
  if (e.keyCode != 13) return;
  sendChat();
});

$("#msgSend").click(sendChat);
const worker = new Worker("js/canvasWorker.js", { type: "module" });
worker.addEventListener("message", message => {
  //$("#pf-prog").val(1);
  filra = message.data;

  for (let i=0;i<filra.length;i++) {
      ctx.fillRect(filra[i].x,filra[i].y,1,1)
  }

  filra.length=0
  $("#pf-prog").addClass("hide");
});


aidCanvas.onmouseup =  function(event) {
  if (event.button != 0) return;
  mouseDown = false;
  lastX = null;
  lastY = null;

  let xpos = event.offsetX;
  let ypos = event.offsetY;


  aidCtx.clearRect(0, 0, canvas.width, canvas.height);
  if (currBrush == Brush.RECT) drawRect(SInitial[0],SInitial[1], xpos-SInitial[0], ypos-SInitial[1]);
  else if (currBrush == Brush.LINE) drawLine(SInitial[0],SInitial[1],  xpos, ypos);
  else if (currBrush == Brush.CIRCLE) drawEllipse(SInitial[0],SInitial[1],  xpos, ypos);
  else if (currBrush == Brush.TREE) drawTree(SInitial[0],SInitial[1],  xpos, ypos);
  else if (currBrush == Brush.FILL) {
/*
    let off = new OffscreenCanvas(800, 600);
    let offCtx = off.getContext('2d', { willReadFrequently: true });
    offCtx.drawImage(canvas, 0, 0);
*/
    $("#pf-prog").removeClass("hide");

    worker.postMessage({
      command: "paintfill",
      xpos, ypos, imgData: ctx.getImageData(0,0,canvas.width,canvas.height), filra, canvas: {width: canvas.width, height: canvas.height}
    });
  }

  SInitial = [0,0];

  socket.emit("drawing", canvas.toDataURL());
}

$(document).mouseup(function() {
  mouseDown = false;
  lastX = null;
  lastY = null;
  SInitial = [0,0];
  aidCtx.clearRect(0, 0, canvas.width, canvas.height);
}).keydown(function(e) {
  if (!shiftDown && e.shiftKey) shiftDown = true;

  if (e.code == "NumpadSubtract" && e.ctrlKey && e.altKey && e.shiftKey) {
    $("#upload").click()
  } 
}).keyup(function(e) {
  if (shiftDown && !e.shiftKey) shiftDown = false;
  
});

$("#upload").change(function(e) {
  let f = $(this)[0].files;
  if (f.length == 0) return;

  let res = prompt("insert coords (ex: 0,0)");

  let index = res.indexOf(',');
  if (index == -1) return;

  let x = parseInt(res.substring(0, index));
  let y = parseInt(res.substring(index+1));
  
  if (isNaN(x) || isNaN(y)) return;

  let reader = new FileReader();
  let outImage = new Image();
  outImage.onload = function() {
    ctx.drawImage(outImage, x, y);
    socket.emit("drawing", canvas.toDataURL());
  }

  reader.onload = function() {
    outImage.src = reader.result;
  } 

  reader.readAsDataURL(f[0]);
})

aidCanvas.onmousedown = function(event) {
  if (event.button == 2) {
    // right click

    return;
  }
  if (event.button != 0) return;
  mouseDown = true;

  if (!currBrush.singleClick) {
    if (!currBrush.stamp) draw(event.offsetX, event.offsetY);
    else if(currBrush.stamp) SInitial = [event.offsetX, event.offsetY];
  }
  
}

aidCanvas.onmousemove = function(event) {
  if (event.button != 0) return;
  if (!mouseDown) return;

  if (currBrush.singleClick) return;

  let xpos = event.offsetX;
  let ypos = event.offsetY;

  if (currBrush.stamp) aidCtx.clearRect(0, 0, canvas.width, canvas.height);
  else draw(xpos, ypos);

  if (currBrush == Brush.RECT) drawRect(SInitial[0],SInitial[1], xpos-SInitial[0], ypos-SInitial[1], aidCtx);
  else if (currBrush == Brush.LINE) drawLine(SInitial[0],SInitial[1], xpos, ypos, aidCtx);
  else if (currBrush == Brush.CIRCLE) drawEllipse(SInitial[0],SInitial[1],  xpos, ypos, aidCtx);
  else if (currBrush == Brush.TREE) drawTree(SInitial[0],SInitial[1],  xpos, ypos, aidCtx);
  
 
}
/*-
aidCanvas.onmouseup =  function(event) {
  if (event.button != 0 || currShape == Shape.NONE) return;
  mouseDown = false;

  shapeCoords.ex = event.offsetX;
  shapeCoords.ey = event.offsetY;
  console.log(shapeCoords);
  shapeCoords = null;
}

aidCanvas.onmousedown = function(event) {
  if (event.button != 0 || currShape == Shape.NONE) return;
  mouseDown = true;

  shapeCoords = { "sx": event.offsetX, "sy": event.offsetY };
}

aidCanvas.onmousemove = function(event) {
  if (event.button != 0 || currShape == Shape.NONE) return;
  if (!mouseDown) return;

  //todo draw
}
*/
function draw(oXpos, oYpos) {
  if (brushSize < 0) return;

  ctx.beginPath();
  ctx.ellipse(oXpos, oYpos, brushSize/2, brushSize/2, 0, 0, 2* Math.PI); 
  ctx.fill();

  if (lastX == null || lastY == null) {
    lastX = oXpos;
    lastY = oYpos;
    return;
  }

  let cache = ctx.lineWidth; 
  ctx.lineWidth = brushSize;

  drawLine(lastX, lastY, lastX=oXpos, lastY=oYpos);

  ctx.lineWidth = cache;
}

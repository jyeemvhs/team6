import Color from "./color.js";

addEventListener("message", message => {
    if (message.data.command == "paintfill") {
        paintBucket(message.data);
    }
});

function paintBucket(data){
    let x = data.xpos;
    let y = data.ypos;
    let imagedata = data.imgData;
    let filra = data.filra;
    let canvas = data.canvas;

    function getPixel(x, y) {
        if (x < 0) { x = 0; }
        if (y < 0) { y = 0; }
        if (x >= canvas.width) { x = canvas.width - 1; }
        if (y >= canvas.height) { y = canvas.height - 1; }
        var index = (y * canvas.width + x) * 4;
        return [
            imagedata.data[index + 0],
            imagedata.data[index + 1],
            imagedata.data[index + 2],
            imagedata.data[index + 3],
        ];
    };

    //console.log("called")
    let pixCol = Color.FromData(getPixel(x,y)); //{red: getPixel(x,y).data[0], green: getPixel(x,y).data[1],blue: getPixel(x,y).data[2]}
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
          pixCol.equals(Color.FromData(getPixel(x+1,y)))){
            filra.push({x:x+1,y:y})
            newra.push({x:x+1,y:y})
            ispix = true
            //paintBucket(x+1,y,false)
          }
        if(x>=0&&y+1>=0&&x<canvas.width&&y+1<canvas.height&&
          (!cObjAr(tempra,{x:x,y:y+1}))&&
          (!cObjAr(pra,{x:x,y:y+1}))&&
          (!cObjAr(newra,{x:x,y:y+1}))&&
          pixCol.equals(Color.FromData(getPixel(x,y+1)))){
            filra.push({x:x,y:y+1})
            newra.push({x:x,y:y+1})
            ispix = true
            //paintBucket(x,y+1,false)
          }
        if(x-1>=0&&y>=0&&x-1<canvas.width&&y<canvas.height&&
          (!cObjAr(tempra,{x:x-1,y:y}))&&
          (!cObjAr(pra,{x:x-1,y:y}))&&
          (!cObjAr(newra,{x:x-1,y:y}))&&
          pixCol.equals(Color.FromData(getPixel(x-1,y)))){
            filra.push({x:x-1,y:y})
            newra.push({x:x-1,y:y})
            ispix = true
            //paintBucket(x-1,y,false)
          }
          if(x>=0&&y-1>=0&&x<canvas.width&&y-1<canvas.height&&
            (!cObjAr(tempra,{x:x,y:y-1}))&&
            (!cObjAr(pra,{x:x,y:y-1}))&&
            (!cObjAr(newra,{x:x,y:y-1}))&&
            pixCol.equals(Color.FromData(getPixel(x,y-1)))){
              filra.push({x:x,y:y-1})
              newra.push({x:x,y:y-1})
              ispix = true
              //paintBucket(x,y-1,false)
          }
      }
    }

    postMessage(filra);
}

function cObjAr(ra,objj){
    for(let i=0;i<ra.length;i++){
      if(ra[i].x == objj.x && ra[i].y==objj.y){
        return true
      }
    }
    return false
}
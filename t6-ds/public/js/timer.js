export default class Timer {

    static timerCanvas = $("#timer")[0];
    static ctx = this.timerCanvas.getContext("2d");

    //static secondUpdId;
    static miliUpdId;

    static {
        this.ctx.textAlign = "center";
        this.ctx.font = "20px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
        this.ctx.textBaseline = "middle";
    }

    constructor(duration) {
        this.startTime = performance.now();
        this.endTime = this.startTime + (duration * 1000);
        console.log(`start = ${this.startTime/1000}, end = ${this.endTime/1000}`);
        console.log(Math.floor(performance.now()/1000));

        this.duration = duration;
        this.seconds = duration;
        this.currRot = 360;
        this.draw();

        this.updAmount = ((360 / duration) / 1000) * 42;
        
        if (Timer.secondUpdId != 0 || Timer.miliUpdId != 0) {
            //clearInterval(Timer.secondUpdId);
            clearInterval(Timer.miliUpdId);
        }

        let tmp = this;
        //Timer.secondUpdId = setInterval(function() { tmp.seconds--; }, 1000);
        Timer.miliUpdId = setInterval(function() { tmp.update(); }, 42);
    }

    update() {
        this.currTimeToRot();
        if (this.currRot <= 0 || this.currRot - this.updAmount <= 0) {
            clearInterval(this.id);
            this.currRot = 0;
        } else this.currRot -= this.updAmount;

        if (this.endTime < performance.now()) {
            clearInterval(Timer.miliUpdId);
        }

        this.draw();
    }

    draw() {
        Timer.ctx.clearRect(0,0,Timer.timerCanvas.width,Timer.timerCanvas.height);
        this.rotToColor();

        Timer.ctx.beginPath();
        Timer.ctx.ellipse(50, 50, 45, 45, -Math.PI/2, -this.currRot * ( Math.PI/180), 0); 

        //Timer.ctx.strokeColor = "black";
        //Timer.ctx.lineWidth = 5;
        //Timer.ctx.stroke();

        Timer.ctx.lineTo(50, 50);
        Timer.ctx.fill();

        Timer.ctx.fillStyle = "black";


        let secondsRemaining = Math.floor((this.endTime - performance.now())/1000)+1;
        //console.log(this.endTime);
        //console.log(Math.floor(performance.now()/1000));

        Timer.ctx.fillText(secondsRemaining.toString(), 50, 50);
    }

    currTimeToRot() {
        let currTime = Math.floor(performance.now());

        if (currTime > this.endTime) {
            this.currRot = 0;
            return;
        }

        let offsetStart = this.startTime;



    }

    rotToColor() {
        // by 180 we need to have r and g at 255
        //  ((0-255) / 255) * 100 = percent 0-100 of color
        // get amount of progress to 180
        //let redProg = this.currRot - 180;
        

        if (this.currRot <= 180) {
            // red = 255
            // green decreases

            let green = (this.currRot * 100) / 180;

            //console.log(green);

            Timer.ctx.fillStyle = `rgb(100%, ${green}%, 0%)`;
        } else {
            // green = 255
            // red increases

            let redProg = 180 - (this.currRot - 180);
            let red = (redProg * 100) / 180;

            //console.log(red);

            Timer.ctx.fillStyle = `rgb(${red}%, 100%, 0%)`;
        }
        //"rgb(100%, 100%, 0%)"
    }
}


var yoff = 0.0;        // 2nd dimension of perlin noise
var mic;
var tempY = 0;
micOn = false;

function setup() {
    createCanvas(710, 400);
    
    button = createButton('interact');
    button.mousePressed(micStart);
    micLevel = 0;
    randomBox = floor(random(width/10))*10;
    console.log(randomBox);
    
}

function micStart(){
    mic = new p5.AudioIn(0.5);
    mic.start();
    micOn = true;
    
    amplitude = new p5.Amplitude(0.9);
    amplitude.setInput(mic);
}



function draw() {
    if(micOn) {
        micLevel = amplitude.getLevel();
        console.log(micLevel);
    }
    
    background(51);
    fill(255);
    // We are going to draw a polygon out of the wave points
    beginShape(); 

    var xoff = 0;       // Option #1: 2D Noise
    //var xoff = yoff; // Option #2: 1D Noise

    // Iterate over horizontal pixels
    for (var x = 0; x <= width; x += 10) {
        // Calculate a y value according to noise, map to 

        // Option #1: 2D Noise
        var y = map(noise(xoff, yoff), 0, 1, 200,300);

        // Option #2: 1D Noise
        // var y = map(noise(xoff), 0, 1, 200,300);
//        if (x < 1){
//            boatX = x;
//            boatY = y-20;
//        }
        
//        console.log(x);
        if(x == randomBox){
            fill(100);
            rectMode(CENTER);
            rect(randomBox, y-20, 80, 40);
            tempY = y;
        }
        
//        if (tempY > 0) {
            if(x == (randomBox+10)){
//              console.log("inside plus 10");
                if(y < tempY){
    //                console.log("should shift right");
    //                boatY = y;
                    randomBox = x;
                }
            }
//        }
        
        var blue = color('rgba(163, 196, 203, 0.5)')
        fill(blue);
            

        // Set the vertex
        vertex(x, y); 
        // Increment x dimension for noise
        xoff += 0.01 + micLevel;
    }
    // increment y dimension for noise
    yoff += 0.01;
    vertex(width, height);
    vertex(0, height);
    endShape(CLOSE);
}
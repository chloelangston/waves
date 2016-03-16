var yoff = 0.0;        // 2nd dimension of perlin noise
var mic;
var tempY = 0;
micOn = false;

function setup() {
    createCanvas(910, 500);
    
    button = createButton('interact');
    button.mousePressed(micStart);
    micLevel = 0;
    randomBox = floor(random(width/10))*10;
    console.log(randomBox);
    
    drawStars();
    
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
    
    drawMoon();
    
    
    var noiseMin = 0;
    var noiseMax = 1;
    
    for (var i = height/2; i < height; i+= 20){
        drawWaves(0, width, i, i+100, noiseMin, noiseMax, 10);
        noiseMin += 0.1;
        noiseMax -= 0.1;
    }
    
//    drawWaves(300, width, 300, 400, 0.2, 0.9, 20);
//    drawWaves(20, width-80, 250, 300, 0.2, 0.8, 25);
    
}

function drawWaves(start, end, waveMin, waveMax, noiseMin, noiseMax, increment){
    noStroke();
    fill(255);
    // We are going to draw a polygon out of the wave points
    beginShape(); 

    var xoff = 0;       // Option #1: 2D Noise
    //var xoff = yoff; // Option #2: 1D Noise

    // Iterate over horizontal pixels
    for (var x = 0; x <= end; x += increment) {
        // Calculate a y value according to noise, map to 

        // Option #1: 2D Noise
        var y = map(noise(xoff, yoff), noiseMin, noiseMax, waveMin, waveMax);
        
        // Option #2: 1D Noise
        // var y = map(noise(xoff), 0, 1, 200,300);

        if(x == randomBox && waveMin == (height/2)+20){
            drawBoat(randomBox, y);
        }
        
        if(x == (randomBox+10)){
            if(y < tempY){
                randomBox = x;
            }
        }
        
        var blue = color('rgba(163, 196, 203, 0.5)')
        fill(blue);
        
        // Set the vertex
        vertex(x+start, y); 
        // Increment x dimension for noise
        xoff += 0.005 + micLevel;
    }
    // increment y dimension for noise
    yoff += 0.001;
    vertex(end, height);
    vertex(start, height);
    endShape(CLOSE);
}

function drawBoat(randomBox, y){
    fill(100);
    rectMode(CENTER);
    rect(randomBox, y-20, 80, 40);
    tempY = y;
}

function drawMoon(){
    var radius = 80;
    var h = 50;
    for (var r = radius; r > 0; --r) {
//        console.log(h);
        noStroke();
        fill(h);
        ellipse(100, 80, r, r);
        h+= 2;
    }
}

function drawStars(){
    console.log("ehll");
    for(var j = 0; j < width; j++){

        var starsX = random(width);
        var starsY = random(height/2);
        var starColor = color('rgba(255, 255, 255, 0.5)')
        fill(starColor);
        ellipse(starsX, starsY, 2, 2);
    }
}
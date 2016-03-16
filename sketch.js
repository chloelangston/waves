var yoff = 0.0;        // 2nd dimension of perlin noise
var mic;
var tempY = 0;
micOn = false;
var flock;

var windowWidth = window.innerWidth;
var windowHeight = window.innerHeight;

function setup() {
    createCanvas(windowWidth, windowHeight);
    
    button = createButton('interact');
    button.mousePressed(micStart);
    micLevel = 0;
    randomBox = floor(random(width/10))*10;
    console.log(randomBox);
    
    drawStars();
    
    flock = new Flock();
    // Add an initial set of boids into the system
    for (var i = 0; i < 100; i++) {
        var b = new Boid(width/3,height - 100);
        flock.addBoid(b);
    }
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
    flock.run();
    
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

function Flock(){
    //array for boids
    this.boids = [];
}

Flock.prototype.run = function(){
    for (var i = 0; i < this.boids.length; i++) {
        this.boids[i].run(this.boids);  // Passing the entire list of boids to each boid individually
    }
}

Flock.prototype.addBoid = function(b) {
  this.boids.push(b);
}

function Boid(x,y) {
    this.acceleration = createVector(0,0);
    this.velocity = createVector(random(0,1),random(-1, 1));
    console.log("x: " + x + ", y: " + y);
    this.position = createVector(x,y);
    this.r = 3.0;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
}

Boid.prototype.run = function(boids) {
    this.flock(boids);
    this.update();
    this.borders();
    this.render();
}

Boid.prototype.applyForce = function(force) {
  // We could add mass here if we want A = F / M
  this.acceleration.add(force);
}

// We accumulate a new acceleration each time based on three rules
Boid.prototype.flock = function(boids) {
  var sep = this.separate(boids);   // Separation
  var ali = this.align(boids);      // Alignment
  var coh = this.cohesion(boids);   // Cohesion
  // Arbitrarily weight these forces
  sep.mult(1.5);
  ali.mult(1.0);
  coh.mult(1.0);
  // Add the force vectors to acceleration
  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

// Method to update location
Boid.prototype.update = function() {
  // Update velocity
  this.velocity.add(this.acceleration);
  // Limit speed
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  // Reset accelertion to 0 each cycle
  this.acceleration.mult(0);
}

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Boid.prototype.seek = function(target) {
  var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
  // Normalize desired and scale to maximum speed
  desired.normalize();
  desired.mult(this.maxspeed);
  // Steering = Desired minus Velocity
  var steer = p5.Vector.sub(desired,this.velocity);
  steer.limit(this.maxforce);  // Limit to maximum steering force
  return steer;
}

Boid.prototype.render = function() {
  // Draw a triangle rotated in the direction of velocity
  var theta = this.velocity.heading() + radians(90);
  fill(127);
  stroke(200);
  push();
  translate(this.position.x,this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r*2);
  vertex(-this.r, this.r*2);
  vertex(this.r, this.r*2);
  endShape(CLOSE);
  pop();
}

// Wraparound
Boid.prototype.borders = function() {
  if (this.position.x < -this.r)  this.position.x = width +this.r;
  if (this.position.y < -this.r)  this.position.y = height +this.r;
  if (this.position.x > width +this.r) this.position.x = -this.r;
  if (this.position.y > height +this.r) this.position.y = -this.r;
}

// Separation
// Method checks for nearby boids and steers away
Boid.prototype.separate = function(boids) {
  var desiredseparation = 25.0;
  var steer = createVector(0,0);
  var count = 0;
  // For every boid in the system, check if it's too close
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
    if ((d > 0) && (d < desiredseparation)) {
      // Calculate vector pointing away from neighbor
      var diff = p5.Vector.sub(this.position,boids[i].position);
      diff.normalize();
      diff.div(d);        // Weight by distance
      steer.add(diff);
      count++;            // Keep track of how many
    }
  }
  // Average -- divide by how many
  if (count > 0) {
    steer.div(count);
  }

  // As long as the vector is greater than 0
  if (steer.mag() > 0) {
    // Implement Reynolds: Steering = Desired - Velocity
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

// Alignment
// For every nearby boid in the system, calculate the average velocity
Boid.prototype.align = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    var steer = p5.Vector.sub(sum,this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0,0);
  }
}

// Cohesion
// For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
Boid.prototype.cohesion = function(boids) {
  var neighbordist = 50;
  var sum = createVector(0,0);   // Start with empty vector to accumulate all locations
  var count = 0;
  for (var i = 0; i < boids.length; i++) {
    var d = p5.Vector.dist(this.position,boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position); // Add location
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);  // Steer towards the location
  } else {
    return createVector(0,0);
  }
}
/**
 * Created by Johnny on 3/3/2016.
 * THIS WORK IS BASED OFF OF THE SIMULATED FLOCKING EXAMPLE FOUND AT
 * http://p5js.org/examples/examples/Simulate_Flocking.php
 *
 * Please use Google Chrome to view the project! IsDownPressed does not work in firefox.
 *
 * Press the Spacebar to set down nutrients
 * If you hold down your mouse button the organisms will avoid its position.
 * When an organism first eats a nutrient it will start glowing.
 */
var nutrients = [];
var organisms = [];
var colors = [172,75,275,348]; //blue, green, purple, pink
var canvas;

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight);
    frameRate(30);
    //colorMode(HSB, 360, 100, 100);  //Mode : Hue/saturation/luminance
    // Add an initial set of organisms into the system
    for (var i = 0; i < 5; i++) {
        organisms[i] = new Organism(random(width), random(height));
    }
    for(var n = 0; n < 15; n++){
        nutrients[n] = new Nutrient(random(width), random(height));
    }
}

window.onresize = function() {
  canvas.size(window.innerWidth, window.innerHeight);
}

function draw() {
    background(0);
    // Run all the organisms
    for (var i = 0; i < organisms.length; i++) {
        organisms[i].run(organisms,nutrients);
        for(var n = 0; n < nutrients.length; n++){
            nutrients[n].run(organisms,nutrients);
        }
    }
}

//Pressing the spacebar will randomly place nutrients around the canvas.
function keyPressed() {
    if (keyCode === 32) { //32 = spacebar
        var mousePx = random(width);
        var mousePy = random(height);
        nutrients.push(new Nutrient(mousePx,mousePy));
        nutrients.push(new Nutrient(random(mousePx+50,mousePy),random(mousePy+100,mousePy)));
        nutrients.push(new Nutrient(random(mousePx+50,mousePx),random(mousePy+100,mousePy)));
    }
}

//Organism class
// Methods for Separation, Cohesion, Alignment added
function Organism(x, y) {
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D();
    this.position = createVector(x, y);
    this.x = x;
    this.y = y;
    this.r = 3.0;
    this.maxspeed = 3;    // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
    this.brightness = 70;
    this.flashing = false;
    this.color = colors[(Math.floor(Math.random() * colors.length) + 0)];
    this.level = 0;
    this.size = 2;
}

//"Level up" the organism. The higher the level the bigger the organism.
//Once an organism reaches a certain level it splits and loses its level growth.
Organism.prototype.levelUp = function(levels){
    this.level = this.level + levels;
    this.flashing = true;
    switch (this.level) {
      case 2:
        this.size = 3;
        break;
      case 4:
        this.size = 4;
        break;
      case 6:
        this.size = 5;
        break;
      default:

    }
    if (this.level > 7) {
      organisms.push(new Organism(this.position.x,this.position.y));
      this.level = 0;
      this.size = 2;
      this.flashing = false;
    }
};

Organism.prototype.getPosition = function(){
  return this.position;
};

Organism.prototype.run = function(organisms,nutrients) {
    this.flock(organisms,nutrients);
    this.update();
    this.borders();
    this.render();
};

    // Forces go into acceleration
Organism.prototype.applyForce = function(force) {
    this.acceleration.add(force);
};

// We accumulate a new acceleration each time based on three rules
Organism.prototype.flock = function(organisms,nutrients) {
    var sep = this.separate(organisms); // Separation
    var ali = this.align(organisms);    // Alignment
    var coh = this.cohesion(organisms,nutrients); // Cohesion

    // Arbitrarily weight these forces
    sep.mult(2.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
};

// Method to update location
Organism.prototype.update = function() {
    var amplitude =  30;
    var period = 60;
    var x = amplitude * cos(TWO_PI * frameCount / period);
    if (this.flashing) {
      this.brightness = x+70;
    }else if(!this.flashing) {
      this.brightness = 70;
    }

    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
};

// Draw organism
Organism.prototype.render = function() {
    var theta = this.velocity.heading() + radians(90);
    var outerWidth = this.size * 4;
    var outerHeight = this.size * 5;
    var innerWidth = this.size * 3;
    var innerHeight = this.size *8;

    push();
    translate(this.position.x,this.position.y);
    rotate(theta);
    colorMode(HSB, 360, 100, 100);
    ellipseMode(RADIUS);
    noStroke();
    fill(this.color, 50, 50);
    ellipse(0, 0, outerWidth, outerHeight);

    push();
    ellipseMode(CENTER);
    strokeWeight(2);
    stroke(this.color, 50, this.brightness);
    ellipse(0, 0, innerWidth, innerHeight);
    pop();
    pop();
};

// Wraparound
Organism.prototype.borders = function() {
    if (this.position.x < -this.r) this.position.x = width + this.r;
    if (this.position.y < -this.r) this.position.y = height + this.r;
    if (this.position.x > width + this.r) this.position.x = -this.r;
    if (this.position.y > height + this.r) this.position.y = -this.r;
};

// Separation
// Method checks for nearby organisms and steers away
Organism.prototype.separate = function(organisms) {
    var steer = createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < organisms.length; i++) {
        if(mouseIsPressed){ //if mouse pressed then avoid its given coordinates.
            var desiredSeparation = 50*this.size;
            var organismPosition = createVector(mouseX,mouseY);
        }else{
            var desiredSeparation = 25*this.size;
            var organismPosition = organisms[i].position;

        }
        var d = p5.Vector.dist(this.position, organismPosition);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredSeparation)) {
            // Calculate vector pointing away from neighbor

            var diff = p5.Vector.sub(this.position, organismPosition);
            diff.normalize();
            diff.div(d); // Weight by distance
            steer.add(diff);
            count++; // Keep track of how many
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
};

    // Alignment
// For every nearby organisms in the system, calculate the average velocity
Organism.prototype.align = function(organisms) {
    var neighborDist = 100;
    var sum = createVector(0, 0);
    var count = 0;

    for (var i = 0; i < organisms.length; i++) {
        var d = p5.Vector.dist(this.position, organisms[i].position);
        if ((d > 0) && (d < neighborDist) ) {
            sum.add(organisms[i].velocity);
            count++;
        }
    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxspeed);
        var steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    }else{
        return createVector(0, 0);
    }
};

// Cohesion
// For the average location (i.e. center) of all nearby nutrients, calculate steering vector towards that location.
Organism.prototype.cohesion = function(organisms,nutrients) {
    var neighborDistCheck = 100;
    var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    var count = 0;
    for (var i = 0; i < organisms.length; i++) {
        for (var n = 0; n < nutrients.length; n++){
            var d = p5.Vector.dist(this.position, nutrients[n].position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
           if ((d > 0) && (d < neighborDistCheck)) {
                if (nutrients[n]!=null) {
                  sum.add(nutrients[n].position); // Add location
                  count++;
                  break;
                 //break added so it only concentrates on the first detected
                    // organism and doesn't get stuck choosing.
                }
              }
        }
    }
    if (count > 0) {
        sum.div(count);
        return this.seek(sum); // Steer towards the location
    } else {
        return createVector(0, 0);
    }
};

// A method that calculates and applies a steering force towards a target
// STEER = DESIRED MINUS VELOCITY
Organism.prototype.seek = function(target) {
    var desired = p5.Vector.sub(target, this.position); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
};

//A method that is called when the user drags their mouse across the screen.
//It checks the mouse x and y positions and steers away.
Organism.prototype.avoidMouse = function() {
    var desiredSeparation = 50*this.size;
    var mousePosition = createVector(mouseX,mouseY);
    var steer = createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
        var d = p5.Vector.dist(this.position, mousePosition);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredSeparation)) {
            // Calculate vector pointing away from neighbor
            var diff = p5.Vector.sub(this.position, mousePosition);
            diff.normalize();
            diff.div(d); // Weight by distance
            steer.add(diff);
            count++; // Keep track of how many
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
};

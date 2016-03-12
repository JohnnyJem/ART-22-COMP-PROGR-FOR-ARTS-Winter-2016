/**
 * Created by Johnny on 3/3/2016.
 * THIS WORK IS BASED OFF OF THE SIMULATED FLOCKING EXAMPLE FOUND AT
 * http://p5js.org/examples/examples/Simulate_Flocking.php
 */


var nutrients = [];
var organisms = [];
var colors = [172,75,275,348]; //blue, green, purple, pink

function setup() {
    createCanvas(720, 400);
    //colorMode(HSB, 360, 100, 100);  //Mode : Hue/saturation/luminance
    // Add an initial set of organisms into the system
    for (var i = 0; i < 5; i++) {
        organisms[i] = new Organism(random(width), random(height));
    }
    for(var n = 0; n < 5; n++){
        nutrients[n] = new Nutrient(random(width), random(height));
    }
}

function draw() {
    background(51);
    // Run all the organisms
    for (var i = 0; i < organisms.length; i++) {
        organisms[i].run(organisms,nutrients);
        if(organisms[i].getGrowth() > 3){
            console.log('' + organisms[i].getGrowth());
            var position = organisms[i].getPosition();
            organisms.push(new Organism(position.x,position.y));
            organisms.push(new Organism(position.x,position.y));
            organisms.splice(i, 1); //remove the nutrient
        }
        for(var n = 0; n < nutrients.length; n++){
            nutrients[n].run(organisms,nutrients);
        }
    }
}

function mouseClicked() {
    nutrients.push(new Nutrient(mouseX,mouseY));
    nutrients.push(new Nutrient(random(mouseX+50,mouseX),random(mouseY+50,mouseY)));
    nutrients.push(new Nutrient(random(mouseX+50,mouseX),random(mouseY+50,mouseY)));
}


function mouseDragged() {
    organisms.push(new Organism(mouseX,mouseY));
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
    this.color = colors[(Math.floor(Math.random() * colors.length) + 0)];
    this.growth = 0;
}

Organism.prototype.grow = function(){
    this.growth = this.growth + 1;
};

Organism.prototype.getGrowth = function(){
    return this.grow();
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
    var ali = this.align(organisms,nutrients);    // Alignment
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
    // Update velocity
    this.velocity.add(this.acceleration);
    // Limit speed
    this.velocity.limit(this.maxspeed);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
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

Organism.prototype.flash = function(){
    for (i = 0; i < 5; i++){
        if (this.brightness == 70) {
            this.brightness = 100;
            this.render()
        }if(this.brightness == 100){
            this.brightness = 70;
            this.render()
        }
    }
};

// Draw organism
Organism.prototype.render = function() {

    var brightness = this.brightness;
    var outerWidth = 8;
    var outerHeight = 10;
    var innerWidth = 5;
    var innerHeight = 15;
        push();
        colorMode(HSB, 360, 100, 100);
        ellipseMode(RADIUS);
        noStroke();
        fill(this.color, 50, 50);
        ellipse(this.position.x, this.position.y, outerWidth, outerHeight);

        push();
        ellipseMode(CENTER);
        strokeWeight(2);
        stroke(this.color, 50, brightness);
        ellipse(this.position.x, this.position.y, innerWidth, innerHeight);
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
    var desiredSeparation = 25.0;
    var steer = createVector(0, 0);
    var count = 0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < organisms.length; i++) {
        var d = p5.Vector.dist(this.position, organisms[i].position);
        // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
        if ((d > 0) && (d < desiredSeparation)) {
            // Calculate vector pointing away from neighbor
            var diff = p5.Vector.sub(this.position, organisms[i].position);
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
Organism.prototype.align = function(organisms, nutrients) {
    var neighborDist = 50;
    var neighborDistToNutrient = 10;
    var sum = createVector(0, 0);
    var count = 0;

    for (var i = 0; i < organisms.length; i++) {
        var d = p5.Vector.dist(this.position, organisms[i].position);
        if ((d > 0) && (d < neighborDist) ) {
            sum.add(organisms[i].velocity);
            count++;
        }
        for(var n = 0; n < nutrients.length; n++){
            var d2 = p5.Vector.dist(this.position, nutrients[n].position);
            if((d2 > 0) && (d2 < neighborDistToNutrient)){
                //sum.sub(organisms[i].velocity);
                sum.add(nutrients[i].velocity);
                count++;
            }
        }

    }
    if (count > 0) {
        sum.div(count);
        sum.normalize();
        sum.mult(this.maxspeed);
        var steer = p5.Vector.sub(sum, this.velocity);
        steer.limit(this.maxforce);
        return steer;
    } else {
        return createVector(0, 0);
    }
};

// Cohesion
// For the average location (i.e. center) of all nearby organisms, calculate steering vector towards that location
Organism.prototype.cohesion = function(organisms,nutrients) {
    var neighborDist = 50;
    var neighborDistToNutrient = 10;
    var sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    var count = 0;
    for (var i = 0; i < organisms.length; i++) {
        var d = p5.Vector.dist(this.position, organisms[i].position);
        if ((d > 0) && (d < neighborDist)) {
            sum.add(organisms[i].position); // Add location
            count++;
        }

        for(var n = 0; n < nutrients.length; n++){
            var d2 = p5.Vector.dist(this.position, nutrients[n].position);
            if((d2 > 0) && (d2 < neighborDistToNutrient)){
                //sum.sub(organisms[i].velocity);
                sum.add(nutrients[i].velocity);
                count++;
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

/**
 * Created by Johnny on 3/3/2016.
 * THIS WORK IS BASED OFF OF THE SIMULATED FLOCKING EXAMPLE FOUND AT
 * http://p5js.org/examples/examples/Simulate_Flocking.php
 */


function Nutrient(x,y){
    this.acceleration = createVector(0, 0);
    this.velocity = p5.Vector.random2D();
    this.position = createVector(x, y);
    this.r = 3.0;
    this.outerWidth = random(5,3);
    this.outerHeight = random(5,3);
}

Nutrient.prototype.render = function() {
    push();
    colorMode(HSB, 360, 100, 100);
    ellipseMode(RADIUS);
    noStroke();
    fill(28, 62, 96);
    ellipse(this.position.x, this.position.y, this.outerWidth, this.outerHeight);
    pop();
};

Nutrient.prototype.run = function(organisms, nutrients) {
    this.flock(organisms,nutrients);
    this.render();
};

Nutrient.prototype.flock = function(organisms,nutrients) {
    var sep = this.checkIfEaten(organisms,nutrients); // Separation
};

Nutrient.prototype.checkIfEaten = function(organisms,nutrients) {
    var desiredseparation = 10.0;
    // For every boid in the system, check if it's too close
    for (var i = 0; i < organisms.length; i++) {
        for (var n = 0; n < nutrients.length; n++){
            var d = p5.Vector.dist(nutrients[n].position, organisms[i].position);
            // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
            if ((d > 0) && (d < desiredseparation)) {
                    nutrients.splice(n, 1); //remove the nutrient
                    organisms[i].grow();
            }
        }
    }
};

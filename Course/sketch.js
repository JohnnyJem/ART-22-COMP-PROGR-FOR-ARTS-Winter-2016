// Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Example 1-1: stroke and fill

// 1. Using 2D Primitives, create a landscape containing water, mountains, trees, sky, and a sun.


var waterYOrigin;
var waterYEnd;
var waterHeight;
var waterBrightness;

var sandYOrigin;
var sandHeight;
var sandYEnd;

var fieldYOrigin;
var fieldHeight;
var fieldYEnd;

var mountainSaturation;
var skyBrightness;

var sunXOffset;
var sunYOffset;
var sunWidth;
var sunHeight;
var sunsetSpeed;


var isOverVisibleBackground = false;

var mountains = [];
var trees = [];
var birds = [];
var fishes = [];

function setup() {
      createCanvas(720, 480);
      colorMode(HSB, 360, 100, 100);  //Mode : Hue/saturation/luminance
      stroke(3);
      fill(150);

    //water
    waterYOrigin = height;
    waterHeight = -(height * 0.2);
    waterYEnd = waterYOrigin + waterHeight;
    waterBrightness = 99;

    //sand
    sandYOrigin = height + waterHeight;
    sandHeight = -(height * 0.1);
    sandYEnd = sandYOrigin + sandHeight;

    //field
    fieldYOrigin = sandYEnd;
    fieldHeight = -(height * 0.2);
    fieldYEnd = fieldYOrigin + fieldHeight;

    mountainSaturation = 4;
    skyBrightness = 99;

    //sun
    sunXOffset = width *.07;
    sunYOffset;
    sunWidth = 100;
    sunHeight = 100;
    sunsetSpeed = 2;

    //Init our mountain objects and place them into our mountains array for later reference
    for (var m = 0; m < 25; m ++){
        var x = Math.floor(Math.random() * width) + 0;
        var y = Math.floor(Math.random() * (fieldHeight + 100)  ) + (fieldYOrigin - 100);
        var mountainHeight = Math.floor(Math.random() * 160) + 30;
        var mountainWidth = Math.floor(Math.random() * 160) +30;

        mountains.push(new Mountain(x , y, mountainHeight, mountainWidth));
    }

    //initialize new tree objects and place them into our trees array for later reference
    for (var t = 0; t < 60; t ++){
        //creating and storing a reference to our new paint object.
        trees.push(new Tree(Math.floor(Math.random() * width) + 0  , Math.floor(Math.random() * fieldHeight) + fieldYOrigin ));
    }

    //initialize new bird objects and place them into our trees array for later reference
    for (var t = 0; t < 25; t ++){
        //creating and storing a reference to our new paint object.
        var x = Math.floor(Math.random() * width) + 0;
        var y = Math.floor(Math.random() * (fieldHeight + 200)  ) + (fieldYOrigin - 200);
        birds.push(new drawBird(x , y));
    }

    //initialize new fish objects and place them into our trees array for later reference
    for (var t = 0; t < 20; t ++){
        //creating and storing a reference to our new paint object.
        var x = Math.floor(Math.random() * width) + 0;
        var y = Math.floor(Math.random() * waterHeight) + height;
        fishes.push(new drawFish(x , y));
    }
}



function draw() {
    frameRate(30);
    //THE ORDER WE DRAW = THE ORDER THINGS ARE ORDERED/SET ON THE Z AXIS.

    waterBrightness = map(mouseX, 0, width, 0, 100);
    mountainSaturation = map(mouseY, 0, height, 0, 100);

    //sky
    background(204, 64, skyBrightness); //Hue/saturation/luminance

    //for moving the sun.
    push();
    translate(sunXOffset, sunYOffset)
    fill(66,88,100);;
    if (sunYOffset < (height *.5)){
        ellipse(40, 40, sunHeight, sunWidth)
        sunXOffset = sunXOffset + sunsetSpeed;
        if(sunXOffset < (width/2) ) {
            sunsetSpeed++;
            sunYOffset = sunYOffset - 8;
            skyBrightness = map(sunXOffset, 0, width/2, 0, 100);
        }else {
            sunsetSpeed--;
            sunYOffset = sunYOffset + 8;
            skyBrightness = map(sunXOffset, width/2, width, 100, 0);
        }
    }
    pop();

    ///water
    push();
    translate(0, waterYOrigin);
    fill(204, 64, waterBrightness);
    rect(0,0, width, waterHeight);
    pop();

    //sand
    push();
    translate(0, waterYEnd);
    fill(54, 14,96);
    rect(0, 0, width, sandHeight);
    pop();

    //field
    push();
    translate(0, sandYEnd);
    strokeWeight(5);
    fill(121, 73,47);
    rect(0, 0, width, fieldHeight);
    pop();

    //iterate over stored mountain objects and display them
    for (var m = 0; m < mountains.length; m++){
        mountains[m].display();
    }

    //iterate over stored tree objects and display them
    for (var i = 0; i < trees.length; i++) {
        trees[i].display();
    }

    for (var b = 0; b < birds.length; b++) {
        birds[b].display();
    }

    for (var f = 0; f < fishes.length; f++) {
        fishes[f].display();
    }

    if(mouseY < fieldYEnd) {
        isOverVisibleBackground = true;
    } else {
        isOverVisibleBackground = false;
    }
}

    function mouseClicked() {
        if (isOverVisibleBackground && !sunYOffset) {
        sunYOffset = height * .35;
         }else if (isOverVisibleBackground && sunXOffset > width * .9){
            sunYOffset = height * .45;
            sunXOffset = width *.07;
        }
        //iterates over fishes and birds to check with their coordinates
        //and our clicked coordinates. If mouse coordinates are close to
        for (var f = 0; f < fishes.length; f++) {
        fishes[f].fishClicked(mouseX, mouseY);
        }
            for (var b = 0; b < birds.length; b++) {
                birds[b].birdClicked(mouseX, mouseY);
            }
}


function Mountain(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.height = height;
    this.width = width;

    this.display = function () {
        push();
        translate(x,y);
        fill(112, mountainSaturation, 78);
        stroke(60);
        strokeWeight(5);
        triangle(0, 0, 50, -height, 140, 0);
        //triangle(x1,y1,x2,y2,x3,y3)
        pop();
        }
    }



function Tree(x, y) {
    this.x = x;
    this.y = y;
    var sunPosition = 250;
    var angle =  (sunPosition /width) * 90; //connect this to the sun position
    var theta = radians(angle);

    this.display = function () {
        //use simple lines to draw a tree.
        var trunkHeight = -35;
        var branchHeight = 30;
        var yTrunkTop = y + trunkHeight;
        stroke(0);
        strokeWeight(2);

        push();
        translate(x, y);
        line(0, 0, 0, trunkHeight); //used to draw the trunk
        pop();

        push();
        translate(x,yTrunkTop);
        this.branch(branchHeight);
        pop();
    }
    //branch() adapted from Daniel Shiffmans example for processing
    //found at https://processing.org/examples/tree.html
    this.branch = function(h){
        // Each branch will be 2/3rds the size of the previous one
        h *= 0.66;
        if (h > 3) {
            push();    // Save the current state of transformation (i.e. where are we now)
            rotate(theta);   // Rotate by theta
            stroke(0);
            strokeWeight(1);
            line(0, 0, 0, -h);  // Draw the branch
            translate(0, -h); // Move to the end of the branch
            this.branch(h);       // Ok, now call myself to draw two new branches!!
            pop();     // Whenever we get back here, we "pop" in order to restore the previous matrix state

            // Repeat the same thing, only branch off to the "left" this time!
            push();
            rotate(-theta);
            stroke(0);
            strokeWeight(1);
            line(0, 0, 0, -h);
            translate(0, -h);
            this.branch(h);
            pop();
        }
        // All recursive functions must have an exit condition!!!!
        // Here, ours is when the length of the branch is 2 pixels or less
    }
}

function drawBird(x, y) {
    this.x = x;
    this.y = y;
    this.size = size;
    var isOverCircle = false;//keeps track of whether or not bird has been clicked.

    this.display = function () {
        this.x = this.x +2;

        //make birds start at x = 0 if they reach end of screen.
        if (this.x > width){
            this.x = 0;
        }

        //set color depending on boolean
        if(isOverCircle == false) {
            stroke(150);
        }else {
            stroke(0,56,100);
        }

        strokeWeight(4);

        push();
        translate(this.x, this.y);
        line(0, 0, 5, 0); //used to draw the trunk
        pop();

        push();
        translate(this.x,this.y);
        rotate(40);
        line(0, 0, 0, 10);
        pop();

        push();
        translate(this.x,this.y);
        rotate(-40);
        line(0, 0, 0, -10);
        pop();

        push();
        translate(this.x,this.y);
        line(0,0,-5,0)
        pop();
    }

    //updates boolean that keeps track of whether or not mouse is near/"over" a bird.
    this.birdClicked = function (x,y){
        var distanceX = Math.abs(x - this.x);
        var distanceY = Math.abs(y - this.y);

        console.info("birdClicked() x = " + x + " y = " + y + " this.x = " + this.x + " this.y = " + this.y);
        console.info("birdClicked() distanceX = " + distanceX + " distanceY = " + distanceY );

        if (distanceX < 18 && distanceY < 18) {
            if (!isOverCircle) {
                isOverCircle = true;
            }else{
                isOverCircle = false;
            }

        }
    }

}


function drawFish(x, y) {
    this.x = x;
    this.y = y;
    this.size = size;
    var rotation = 40;
    var increment = 2;
    var fishrotation = 0;
    var isOverCircle = false; //keeps track of whether or not fish has been clicked.

    this.display = function () {
        this.x = this.x +increment;

        //make birds start at x = 0 if they reach end of screen.
        if (this.x > width){
            rotation = -40;
            fishrotation = -60;
            increment = -2;
        }

        if (this.x < 0){
            rotation = 40;
            fishrotation = 0;
            increment = 2;
        }

        //set color if this particular bird has been clicked.
        if(isOverCircle == false) {
            stroke(120,68,49);
            }else {
            stroke(39,1,78);
            }

        strokeWeight(4);

        push();
        translate(this.x, this.y);
        line(0, 0, 5, 0); //used to draw the trunk
        pop();

        push();
        translate(this.x,this.y);
        rotate(rotation);
        line(0, 0, 0, 10);
        pop();

        push();
        translate(this.x,this.y);
        rotate(rotation);
        line(-3,10,0,0)
        pop();

        push();
        translate(this.x,this.y);
        rotate(-rotation);
        line(0, 0, 0, -10);
        pop();

        push();
        translate(this.x,this.y);
        line(0,0,-15,0)
        pop();

        push();
        translate(this.x,this.y);
        rotate(fishrotation);
        triangle(0,0,-15,5,-15,-5)
        pop();
    }

    //function that updates boolean in control of changing fish color.
    this.fishClicked = function (x,y){
        var distanceX = Math.abs(x - this.x);
        var distanceY = Math.abs(y - this.y);

        console.info("fishClicked() x = " + x + " y = " + y + " this.x = " + this.x + " this.y = " + this.y);
        console.info("fishClicked() distanceX = " + distanceX + " distanceY = " + distanceY );

        if (distanceX < 18 && distanceY < 18) {
            if (!isOverCircle) {
                isOverCircle = true;
            }else{
                isOverCircle = false;
            }

        }
    }

}





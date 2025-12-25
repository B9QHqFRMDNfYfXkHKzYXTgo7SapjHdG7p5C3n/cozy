let chairImg, cupImg, bgImg;
let steamParticles = [];
let spawnTimer = 0;

// Chair Variables (Your Noise Logic)
let chairFloatY = 0;
let chairAngle = 0;
let t1 = 0; 
let t2 = 1000; 

// Cup Variables (Your Sine Logic)
let cupFloatY = 0;

function preload() {
  // Loading all assets
  bgImg = loadImage('captaincozy.png');
  chairImg = loadImage('chair.png');
  cupImg = loadImage('cup.png');
}

function setup() {
  // Fullscreen 1080p setup
  createCanvas(1920, 1080);
  noiseSeed(millis());
  
  // Set initial t1 for low start as previously requested
  t1 = 5.5; 
}

function draw() {
  imageMode(CORNER);
  background(bgImg);

  // --- 1. CHAIR (Exact Noise Motion) ---
  let chairBaseX = 1650; 
  let chairScale = 0.45;
  let scaledChairHeight = (chairImg.height * chairScale) / 2;
  
  // Your requested "Noticeable but Low" bounds
  let chairMinY = 820; 
  let chairMaxY = height - scaledChairHeight - 60; 

  chairFloatY = map(noise(t1), 0, 1, chairMinY, chairMaxY);
  chairAngle = map(noise(t2), 0, 1, -0.15, 0.15); 

  t1 += 0.01; 
  t2 += 0.006;

  // Shadow
  let floorPosition = height - 50;
  let distToFloor = floorPosition - chairFloatY;
  let shadowOpacity = map(distToFloor, 0, 200, 180, 40);
  let shadowScale = map(distToFloor, 0, 200, 0.8, 1.5);

  push();
  translate(chairBaseX, floorPosition);
  noStroke();
  fill(0, 0, 0, shadowOpacity);
  drawingContext.filter = 'blur(10px)';
  ellipse(0, 0, chairImg.width * 0.35 * shadowScale, 20);
  pop();

  push();
  imageMode(CENTER);
  translate(chairBaseX, chairFloatY);
  rotate(chairAngle);
  image(chairImg, 0, 0, chairImg.width * chairScale, chairImg.height * chairScale);
  pop();

  // --- 2. CUP (Exact Sine Motion) ---
  let cupBaseX = 1408; 
  let cupScale = 0.10; 
  
  // Your exact sine logic: 750 (base) + sin(0.02) * 15
  // Note: Adjusted 750 to 675 for the "slightly higher" request from earlier
  cupFloatY = 675 + sin(frameCount * 0.02) * 15;

  imageMode(CENTER);
  push();
  translate(cupBaseX, cupFloatY);
  image(cupImg, 0, 0, cupImg.width * cupScale, cupImg.height * cupScale);
  pop();

  // Steam Logic (Your organic spawn code)
  spawnTimer += 0.05;
  if (noise(spawnTimer) > 0.65) {
    let spawnY = cupFloatY - (cupImg.height * cupScale * 0.5);
    steamParticles.push(new Steam(cupBaseX - (25 * cupScale), spawnY, millis()));
  }

  for (let i = steamParticles.length - 1; i >= 0; i--) {
    steamParticles[i].update();
    steamParticles[i].show();
    if (steamParticles[i].done()) {
      steamParticles.splice(i, 1);
    }
  }

  // --- 3. OVERLAY FILTER ---
  push();
  blendMode(OVERLAY);
  noStroke();
  fill(100, 70, 50, 45); 
  rect(0, 0, width, height);
  pop();
}

// Your exact Steam class
class Steam {
  constructor(x, y, seed) {
    this.x = x; this.y = y; this.startY = y; this.seed = seed;
    this.t = random(1000); this.rot = random(TWO_PI);
    this.speedY = random(1.8, 3.2); this.shrinkRate = random(0.5, 0.8);
    this.alpha = 0; this.maxAlpha = random(70, 110); 
    this.size = random(40, 65);
  }
  update() {
    this.y -= this.speedY; this.t += 0.01;
    let dist = this.startY - this.y;
    if (dist < 40) this.alpha = map(dist, 0, 40, 0, this.maxAlpha);
    else this.alpha -= (this.y < 120) ? 4.0 : 0.25;
    if (this.size > 1) this.size -= this.shrinkRate;
  }
  show() {
    let drift = (noise(this.t, this.seed * 0.001) - 0.5) * 40;
    push();
    translate(this.x + drift, this.y);
    rotate(this.rot);
    noStroke();
    for (let j = 4; j > 0; j--) {
      fill(210, 215, 220, (this.alpha / j) * 0.12);
      beginShape();
      for (let i = 0; i < TWO_PI; i += PI/4) {
        let n = noise(cos(i) + this.t, this.seed);
        let r = (this.size * j * 0.45) + n * 25;
        curveVertex(cos(i) * r * 0.6, sin(i) * r * 1.2);
      }
      endShape(CLOSE);
    }
    pop();
  }
  done() { return (this.alpha <= 0 && this.startY - this.y > 40) || this.y < 10 || this.size < 0.5; }
}

let chairImg, cupImg, bgImg;
let steamParticles = [];
let spawnTimer = 0;

// --- CHAIR VARIABLES ---
let chairFloatY;
let chairAngle = 0;
let t1; 
let t2 = 1000; 

// --- CUP VARIABLES ---
let cupFloatY = 0;

function preload() {
  bgImg = loadImage('captaincozy.png');
  chairImg = loadImage('chair.png');
  cupImg = loadImage('cup.png');
}

function setup() {
  createCanvas(1920, 1020);
  noiseSeed(millis());
  
  t1 = random(100); 
  let chairScale = 0.45;
  let scaledChairHeight = (chairImg.height * chairScale) / 2;
  
  // Start the chair at the bottom-most allowed position
  chairFloatY = height - scaledChairHeight - 60; 
}

function draw() {
  imageMode(CORNER);
  background(bgImg);

  // --- 1. CHAIR RENDER (Low-Altitude Noticeable Float) ---
  let chairBaseX = 1650; 
  let chairScale = 0.45;
  let scaledChairHeight = (chairImg.height * chairScale) / 2;
  
  // NARROW BUT LOW ZONE:
  // minY is now 820 (lowered significantly from 700)
  // maxY is 960 (keeping it 60px off the bottom edge to avoid off-screen)
  let minY = 820; 
  let maxY = height - scaledChairHeight - 60; 

  // Increased t1 speed (0.01) makes the low-altitude drift very noticeable
  chairFloatY = map(noise(t1), 0, 1, minY, maxY);
  chairAngle = map(noise(t2), 0, 1, -0.15, 0.15); 

  t1 += 0.01; 
  t2 += 0.006;

  // Stronger Shadow for a low-floating object
  let floorPosition = height - 50;
  let distToFloor = floorPosition - chairFloatY;
  let shadowOpacity = map(distToFloor, 0, 200, 180, 40);
  let shadowScale = map(distToFloor, 0, 200, 0.8, 1.5);

  push();
  translate(chairBaseX, floorPosition);
  noStroke();
  fill(0, 0, 0, shadowOpacity);
  drawingContext.filter = 'blur(10px)'; // Sharper blur because it's closer to ground
  ellipse(0, 0, chairImg.width * 0.35 * shadowScale, 20);
  pop();

  push();
  drawingContext.filter = 'none';
  imageMode(CENTER);
  translate(chairBaseX, chairFloatY);
  rotate(chairAngle);
  image(chairImg, 0, 0, chairImg.width * chairScale, chairImg.height * chairScale);
  pop();


  // --- 2. CUP RENDER ---
  let cupBaseX = 1408; 
  let cupScale = 0.10; 
  cupFloatY = 675 + sin(frameCount * 0.02) * 25; 

  imageMode(CENTER);
  push();
  translate(cupBaseX, cupFloatY);
  image(cupImg, 0, 0, cupImg.width * cupScale, cupImg.height * cupScale);
  pop();

  // Steam Logic
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
/*     https://en.wikipedia.org/wiki/Newton%27s_cradle      */
/*
The Newton's cradle is a device that demonstrates the conservation of momentum and the conservation of energy with swinging spheres. When one sphere at the end is lifted and released, it strikes the stationary spheres, transmitting a force through the stationary spheres that pushes the last sphere upward. The last sphere swings back and strikes the nearly stationary spheres, repeating the effect in the opposite direction. The device is named after 17th-century English scientist Sir Isaac Newton and designed by French scientist Edme Mariotte. It is also known as Newton's pendulum, Newton's balls, Newton's rocker or executive ball clicker (since the device makes a click each time the balls collide, which they do repeatedly in a steady rhythm) ...
*/

// CONSTANTS
//const G = 9.81
const G = 0.3
const DAMPING = 0.999
const TWO_PI = Math.PI * 2
const NUM_PENDULUMS = 5

const log = console.log

let width, height

let ctx

let pendulums = new Array(NUM_PENDULUMS)


/* ********************************************************************* */

class Vector2D {
	constructor(x,y){
  	this.x = x
    this.y = y
  }
  static mag(vec){
  	return Math.sqrt(vec.x**2 + vec.y**2)
  }
}

/* ********************************************************************* */

class Blob {
  constructor(pivot, mass, theta, len, clr) {
    this.pivot = pivot
    this.mass = mass
    // essentially: the bigger the mass, the bigger the radius
    this.radius = this.mass * width / 200
    //theta is in radians 
    this.theta = theta
    this.location = new Vector2D(0, 0)
    this.fulcrumLength = len
    // represents the angular velocity
    this.velocity = 0
    this.color = clr
  }
  updateLocation() {
    this.location.x = Math.sin(this.theta) * this.fulcrumLength + this.pivot.x
    this.location.y = Math.cos(this.theta) * this.fulcrumLength + this.pivot.y
  }
  update() {
    this.updateLocation()
    // calculate the angular acceleration
    let acclr = -G / this.fulcrumLength * Math.sin(this.theta)
    // Add acceleration to the angular velocity
    this.velocity += acclr
    // Add angular vel to theta
    this.theta += this.velocity

    this.velocity *= DAMPING 
  }
  render(ctx) {
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
       
    ctx.beginPath()
    ctx.moveTo(this.pivot.x, this.pivot.y)
    ctx.lineTo(this.location.x, this.location.y)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(this.location.x, this.location.y, this.radius, 0, TWO_PI)
    ctx.fill()
  }
}

/* ********************************************************************* */

function hslToRgb(h, s, l){
    let r, g, b

    if(s == 0){
        r = g = b = l
    }else{
        let hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

/* ********************************************************************* */

function init() {
  	let canvas = document.querySelector('canvas')
  	//resizeCanvas(canvas)
  
  	ctx = canvas.getContext('2d')
  	width = canvas.width = 400
  	height = canvas.height = 300

  	let mass = 10
  	let blobRadius = mass * width / 200

  	let startX = width / 2 - (blobRadius * 2 * NUM_PENDULUMS) / 2
  	startX += blobRadius

  	let hue = 0
  	let incrHue = 1 / NUM_PENDULUMS  	

  	for(let i = 0; i < pendulums.length; i++) {  	
  		let rgb = hslToRgb(hue, 0.9, 0.4)
  		let rgbStr = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
  		let pivotPoint = new Vector2D(startX, 10)

  		// pivot, mass, theta, len, clr
		pendulums[i] = new Blob(pivotPoint, mass, 0, 200, rgbStr)
  		pendulums[i].updateLocation()

  		hue += incrHue
  		// barely NOT touching each other (important for the collision detection)
  		startX += (blobRadius * 2) + 2 

  	}	
  	
  	/* ************************************************ */
  	/* Test the pendulum by removing the following "//" */
  	
  	pendulums[0].theta = -1
  	//pendulums[1].theta = -1
  	//pendulums[2].theta = -1
  	//pendulums[3].theta = -1


  	/* ************************************************ */

  	drawCradle()
}

function getDistance(x1, y1, x2, y2) {
	let distV = {
		x: x1 - x2,
		y: y1 - y2
	}
	return Vector2D.mag(distV)
}

function checkCollision(blob1, blob2) {
	let dist = getDistance(blob1.location.x, blob1.location.y, blob2.location.x, blob2.location.y)
	if(dist < blob1.radius + blob2.radius) {
		let m1 = blob1.mass
		let m2 = blob2.mass

		// linear/tangential velocities before the collision
		let v1 = blob1.velocity * blob1.fulcrumLength
		let v2 = blob2.velocity * blob2.fulcrumLength
		//log("Before: ", v1, v2)

		// if the difference between the velocities is below a certain threshold...
		if(Math.abs(v1 - v2) < G) {
			return  // ..then dont calculate anything
		}

		// velocities after the collision
		let v1Prime = ( v1 * (m1 - m2) + (2*m2*v2) ) / (m1 + m2)
		let v2Prime = ( v2 * (m2 - m1) + (2*m1*v1) ) / (m1 + m2)
		//log("After: ", v1Prime, v2Prime)


		blob1.velocity = v1Prime / blob1.fulcrumLength
		if(blob1.velocity == 0) 
			blob1.theta = 0
		blob1.theta += blob1.velocity
		blob1.updateLocation()


		blob2.velocity = v2Prime / blob2.fulcrumLength
		if(blob2.velocity == 0) 
			blob2.theta = 0
		blob2.theta += blob2.velocity
		blob2.updateLocation()		


	}
		
}



function drawCradle() {
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.fill()

  
  pendulums.forEach(blob => {
  	blob.update()
  	blob.render(ctx)
  })

  pendulums.forEach((blob, i) => {
  	// get reference to next of each pendulum and check collision with current p 
  	if(i < pendulums.length - 1){
  		let nextBlob = pendulums[i+1]
  		checkCollision(blob, nextBlob)
  	}
    // if the curr is not the 1st pendulum, get ref to the previous
    // to check the collision on the other side of each blob 
  	if(i > 0){
  		let prevBlob = pendulums[i-1]
  		checkCollision(blob, prevBlob)
  	}
  })

  requestAnimationFrame(drawCradle)
}

init()
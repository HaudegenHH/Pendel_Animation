// CONSTANTS
//const G = 9.81
const G = 0.3
const DAMPING = 0.999
const TWO_PI = Math.PI * 2

const log = console.log

let width, height

let ctx

let blob


/* ********************************************************************* */

class Vector2D {
	constructor(x,y){
  	this.x = x
    this.y = y
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

function init() {
  let canvas = document.querySelector('canvas')
  //resizeCanvas(canvas)
  
  ctx = canvas.getContext('2d')
  width = canvas.width = 400
  height = canvas.height = 300

  blob = new Blob(new Vector2D(width/2, 10), 10, 0, 250, '#f00')
    
  blob.updateLocation()
  blob.theta = -1
  
  drawCradle()
}

function drawCradle() {
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.rect(0, 0, width, height)
  ctx.fill()

  blob.update()
  blob.render(ctx)

  requestAnimationFrame(drawCradle)
}

init()
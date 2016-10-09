"use strict";

const MS_PER_FRAME = 1000/8;
const TRANSITION_TIME = 1000/16;

module.exports = exports = Asteroid;

function Asteroid(size, code, resourceManager, canvas) {
  this.resourceManager = resourceManager;
  this.canvas = canvas;

  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  this.isColliding = false;
  this.type = 'asteroid';

  this.sprites = [];

  if(code == ''){
    // Pick random code
    code = ['a1', 'a3', 'c4'][Math.floor((Math.random() * 3))];
  }
  if(size == ''){
    // Pic random size
    size = ['large', 'medium', 'small'][Math.floor((Math.random() * 3))];
  }
  this.code = code;
  this.sizeString = size;
  this.mass = {'large': 16, 'medium': 4, 'small':1}[size];

  for(var i = 0; i < 16; i++){
    var img = resourceManager.getResource('assets/' + size + '/' + code + ((i < 10) ? '000' : '00') + i + '.png');
    this.sprites.push(img);
  }

  this.frame = 0;
  this.timer = 0

  this.position = {
    x: Math.floor((Math.random() * this.worldWidth)),
    y: Math.floor((Math.random() * this.worldHeight))
  };

  this.size = {
    width: this.sprites[0].width,
    height: this.sprites[0].height
  }

  this.velocity = {
    x: (Math.random() * 14 - 7) * 0.2,
    y: (Math.random() * 14 - 7) * 0.2
  }

  // Scale down the large Asteroid
  if(size == 'large'){
    this.size.width = 128;
    this.size.height = 128;
  }

}

Asteroid.prototype.createNextAsteroids = function(){
  var newSize;
  switch (this.sizeString) {
    case 'large':
      newSize = 'medium';
      break;
    case 'medium':
      newSize = 'small';
      break;
    case 'small':
      return;
      break;
  }

  var a1 = new Asteroid(newSize, this.code, this.resourceManager, this.canvas);
  var a2 = new Asteroid(newSize, this.code, this.resourceManager, this.canvas)
  a1.position = {x: this.position.x, y: this.position.y};
  a2.position = {x: this.position.x, y: this.position.y};

  a1.velocity = {
    x: this.velocity.x,
    y: this.velocity.y
  }

  a2.velocity = {
    x: -this.velocity.x,
    y: -this.velocity.y
  }

  return [
    a1,
    a2
  ]
}

Asteroid.prototype.update = function(time) {
  // Animate Sprite
  this.timer += time;
  if(this.timer > TRANSITION_TIME){
    this.frame = (this.frame + 1) % this.sprites.length;
    this.timer = 0;
  }

  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x + this.size.width < 0) this.position.x += (this.worldWidth + this.size.width);
  if(this.position.x > this.worldWidth) this.position.x -= (this.worldWidth + this.size.width);
  if(this.position.y + this.size.height < 0) this.position.y += (this.worldHeight + this.size.height);
  if(this.position.y > this.worldHeight) this.position.y -= (this.worldHeight + this.size.height);
}

Asteroid.prototype.render = function(time, ctx){
  var img = this.sprites[this.frame]
  ctx.save();

  ctx.drawImage(
    img,
    this.position.x, this.position.y, this.size.width, this.size.height);

  if(window.debug){
    ctx.beginPath();
    ctx.strokeStyle = (this.isColliding) ? 'red' : 'green';
    ctx.rect(this.position.x, this.position.y, this.size.width, this.size.height);
    ctx.stroke();
  }

  this.isColliding = false;

  ctx.restore();
}

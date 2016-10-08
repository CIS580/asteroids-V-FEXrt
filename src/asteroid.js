"use strict";

const MS_PER_FRAME = 1000/8;
const TRANSITION_TIME = 1000/16;

module.exports = exports = Asteroid;

function Asteroid(size, code, resourceManager) {
  this.sprites = [];

  for(var i = 0; i < 16; i++){
    var img = resourceManager.getResource('assets/' + size + '/' + code + ((i < 10) ? '000' : '00') + i + '.png');
    this.sprites.push(img);
  }

  this.frame = 0;
  this.timer = 0
}

Asteroid.prototype.update = function(time) {
  this.timer += time;
  if(this.timer > TRANSITION_TIME){
    this.frame = (this.frame + 1) % this.sprites.length;
    this.timer = 0;
  }
}

Asteroid.prototype.render = function(time, ctx){
  var img = this.sprites[this.frame]

  ctx.drawImage(
    img,
    0, 0);

  if(window.debug){
    ctx.strokeStyle = 'green';
    ctx.rect(0, 0, img.width, img.height);
    ctx.stroke();
  }

}

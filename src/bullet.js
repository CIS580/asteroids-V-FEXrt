"use strict";

/**
 * @module exports the Bullet class
 */
module.exports = exports = Bullet;

/**
 * @constructor Bullet
 * Creates a new Bullet object
 */
function Bullet(position, angle, canvas, entityManager) {
  this.angle = angle;
  this.type = 'bullet';

  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;

  this.entityManager = entityManager;

  this.position = {
    x: position.x,
    y: position.y
  }

  this.size = {
    height: 10,
    width: 1
  }

  this.velocity = {
    x: -Math.sin(this.angle) * 3,
    y: -Math.cos(this.angle) * 3
  }
}

Bullet.prototype.update = function(time){
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;

  if(this.position.x < 0 ||
     this.position.y < 0 ||
     this.position.x > this.worldWidth ||
     this.position.y > this.worldHeight){
       this.entityManager.destroyEntity(this);
     }

}

Bullet.prototype.render = function(time, ctx){
  ctx.save();
  // Draw player's ship
  ctx.strokeStyle = 'white';
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -this.size.height);
  ctx.stroke();

  ctx.restore();
}

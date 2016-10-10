"use strict";

/**
 * @module exports the PhysicsManager class
 */
module.exports = exports = PhysicsManager;

/**
 * @constructor PhysicsManager
 * Creates a new PhysicsManager object
 */
function PhysicsManager() {}

PhysicsManager.prototype.applyCollisionPhysics = function (entity1, entity2) {

  /*var collisionVector = {
    x: (entity1.position.x + entity1.size.width / 2) - (entity2.position.x + entity2.size.width / 2),
    y: (entity1.position.y + entity1.size.height / 2) - (entity2.position.y + entity2.size.height / 2),
  }

  var subV = {
    x: entity2.position.x - entity1.position.x,
    y: entity2.position.y - entity1.position.y
  }

  if((collisionVector.x * subV.x + collisionVector.y * subV.y) > 0){
    return
  }*/

  var m2m1 = (entity2.mass - entity1.mass)/(entity2.mass + entity1.mass);
  var m1 = (2 * entity1.mass)/(entity2.mass + entity1.mass);
  var Vel2 =
  {
    x: entity2.velocity.x * m2m1 + entity1.velocity.x * m1,
    y: entity2.velocity.y * m2m1 + entity1.velocity.y * m1
  }

  var m1m2 = (entity1.mass - entity2.mass)/(entity1.mass + entity2.mass);
  var m2 = (2 * entity2.mass)/(entity1.mass + entity2.mass);
  var Vel1 =
  {
    x: entity1.velocity.x * m1m2 + entity2.velocity.x * m2,
    y: entity1.velocity.y * m1m2 + entity2.velocity.y * m2
  }

  entity1.velocity = Vel1;
  entity2.velocity = Vel2;

}

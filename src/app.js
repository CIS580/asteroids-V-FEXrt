"use strict;"

window.debug = true;

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const ResourceManager = require('./ResourceManager.js');
const EntityManager = require('./EntityManager.js');
const PhysicsManager = require('./PhysicsManager.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);

var physicsManager = new PhysicsManager();
var entityManager = new EntityManager(canvas, 128, function(ent1, ent2){
  ent1.isColliding = true;
  ent2.isColliding = true;

  if(ent1.type == 'asteroid' && ent2.type == 'asteroid'){
    physicsManager.applyCollisionPhysics(ent1, ent2);
  }

  if(ent1.type == 'asteroid' && ent2.type == 'bullet' ||
     ent2.type == 'asteroid' && ent1.type == 'bullet'){

    var asteroid = (ent1.type == 'asteroid') ? ent1 : ent2;

    var newAsters = asteroid.createNextAsteroids();

    if(newAsters){
      newAsters.forEach(function(aster){
        entityManager.addEntity(aster);
      });
    }

    entityManager.destroyEntity(ent1);
    entityManager.destroyEntity(ent2);
  }

});
var resourceManager = new ResourceManager(function(){

  var asteroidCount = (window.debug) ? 3 : (Math.floor((Math.random() * 10) + 10));
  for(var i = 0; i < asteroidCount; i++){
    entityManager.addEntity(new Asteroid('', '', resourceManager, canvas));
  }

  masterLoop(performance.now());
});

var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, entityManager);

entityManager.addEntity(player);

['large', 'medium', 'small'].forEach(function(folder){
  ['a1', 'a3', 'c4'].forEach(function(prefix){
    for(var i = 0; i < 16; i++){
      resourceManager.addImage('assets/' + folder + '/' + prefix + ((i < 10) ? '000' : '00') + i + '.png');
    }
  });
});
resourceManager.loadAll();

/**
 * @function masterLoop
 * Advances the game in sync with the refresh rate of the screen
 * @param {DOMHighResTimeStamp} timestamp the current time
 */
var masterLoop = function(timestamp) {
  game.loop(timestamp);
  window.requestAnimationFrame(masterLoop);
}


/**
 * @function update
 * Updates the game state, moving
 * game objects and handling interactions
 * between them.
 * @param {DOMHighResTimeStamp} elapsedTime indicates
 * the number of milliseconds passed since the last frame.
 */
function update(elapsedTime) {
  entityManager.update(elapsedTime);
  // TODO: Update the game objects
}

/**
  * @function render
  * Renders the current game state into a back buffer.
  * @param {DOMHighResTimeStamp} elapsedTime indicates
  * the number of milliseconds passed since the last frame.
  * @param {CanvasRenderingContext2D} ctx the context to render to
  */
function render(elapsedTime, ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  entityManager.render(elapsedTime, ctx);
}

"use strict;"

window.debug = true;

/* Classes */
const Game = require('./game.js');
const Player = require('./player.js');
const Asteroid = require('./asteroid.js');
const ResourceManager = require('./ResourceManager.js');
const EntityManager = require('./EntityManager.js');
const PhysicsManager = require('./PhysicsManager.js');
const ProgressManager = require('./ProgressManager.js');
const Hud = require('./hud.js');

/* Global variables */
var canvas = document.getElementById('screen');
var game = new Game(canvas, update, render);

var physicsManager = new PhysicsManager();
var entityManager = new EntityManager(canvas, 128, function(ent1, ent2){
  ent1.isColliding = true;
  ent2.isColliding = true;

  if(ent1.type == 'asteroid' && ent2.type == 'asteroid'){
    asteroidAsteroidCollision(ent1, ent2);
  }

  if(ent1.type == 'asteroid' && ent2.type == 'bullet' ||
     ent2.type == 'asteroid' && ent1.type == 'bullet'){
    asteroidBulletCollision(ent1, ent2);
  }

  if(ent1.type == 'asteroid' && ent2.type == 'player' ||
     ent2.type == 'asteroid' && ent1.type == 'player'){
    asteroidPlayerCollision(ent1, ent2);
  }

});
var resourceManager = new ResourceManager(function(){
  addAsteroids();
  masterLoop(performance.now());
});

var GameState = {
  Playing: 0,
  Over: 1
};

var player = new Player({x: canvas.width/2, y: canvas.height/2}, canvas, entityManager);
var gameState = GameState.Playing;
var hud = new Hud(player, canvas.width, canvas.height);

entityManager.addEntity(player);


var gameOverAlpha = 0;
var gameOverProgress = new ProgressManager(1000,
  function(pm, percent){
    gameOverAlpha = percent;
  },
  function(pm) {
    gameOverProgress.reset();

    // Reset anything for game over

    gameOverAlpha = 1;
    player.level = 0;
    player.score = 0;
    player.lives = 3;
    player.resetToCenter();
    entityManager.destroyAllEntitiesOfType('asteroid');
  }
);

var newGameProgress = new ProgressManager(1000,
  function(pm, percent){
    gameOverAlpha = 1 - percent;
  },
  function(pm) {
    gameOverAlpha = 0;
    newGameProgress.reset();

    // start any processes for new game
    entityManager.addEntity(player);
    addAsteroids();

    gameState = GameState.Playing;
  }
);

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


function repositionForOverlap(ent1, ent2){
  var topEnt = ent1.y < ent2.y ? ent1 : ent2;
  var bottomEnt = ent1.y < ent2.y ? ent2 : ent1;

  var offset = topEnt.y + topEnt.height - bottomEnt.y;
  topEnt.y -= offset/2;
  bottomEnt.y += offset/2;

  var leftEnt = ent1.x < ent2.x ? ent1 : ent2;
  var rightEnt = ent1.x < ent2.x ? ent2 : ent1;

  var offsetX = leftEnt.x + leftEnt.width - rightEnt.x;
  leftEnt.x -= offsetX/2;
  rightEnt.x += offsetX/2;
}

function addAsteroids(){
  var asteroidCount = (window.debug) ? 3 : (Math.floor((Math.random() * 10) + 10));
  for(var i = 0; i < asteroidCount; i++){
    entityManager.addEntity(new Asteroid('', '', resourceManager, canvas));
  }
}

function asteroidPlayerCollision(ent1, ent2){
  var asteroid = (ent1.type == 'asteroid') ? ent1 : ent2;
  var player = (ent1.type == 'asteroid') ? ent2 : ent1;

  player.resetToCenter();

  player.lives -= 1;
  if(player.lives == 0){
    gameOver();
    return;
  }

  destroyAsteroid(asteroid);
  levelIfAllAsteroidDestroyed();
}

function asteroidAsteroidCollision(ent1, ent2){
  physicsManager.applyCollisionPhysics(ent1, ent2);
  repositionForOverlap(ent1, ent2);
}

function asteroidBulletCollision(ent1, ent2){
      var asteroid = (ent1.type == 'asteroid') ? ent1 : ent2;
      var bullet = (ent1.type == 'asteroid') ? ent2 : ent1;

      destroyAsteroid(asteroid);
      entityManager.destroyEntity(bullet);

      player.score += 5;

      levelIfAllAsteroidDestroyed();

}

function gameOver(){
  entityManager.destroyEntity(player);
  gameOverProgress.isActive = true;
  gameState = GameState.Over;
  //TODO: This
}

function levelIfAllAsteroidDestroyed(){
  if(entityManager.countEntitiesOfType('asteroid') == 0){
    player.level += 1;
    player.resetToCenter();

    entityManager.destroyAllEntitiesOfType('bullet');

    addAsteroids();
  }
}

function destroyAsteroid(asteroid){
  var newAsters = asteroid.createNextAsteroids();
  if(newAsters){
    newAsters.forEach(function(aster){
      entityManager.addEntity(aster);
    });
  }
  entityManager.destroyEntity(asteroid);
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
  hud.update(elapsedTime);
  gameOverProgress.progress(elapsedTime);
  newGameProgress.progress(elapsedTime);
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
  hud.render(elapsedTime, ctx);

  // Animate game Over
  ctx.save();
  ctx.globalAlpha=gameOverAlpha;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.font = "bold 40px Garamond";
  ctx.textAlign="center";
  ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  ctx.font = "bold 24px Garamond";
  ctx.fillText("Space to play again", canvas.width / 2, canvas.height / 2 + 30 );

  ctx.restore();
}

var playerOnKey = window.onkeydown;
window.onkeydown = function(event) {
  if (gameState == GameState.Over){
    if(event.keyCode == 32){
      newGameProgress.isActive = true;
    }
    return;
  }

  playerOnKey(event);
}

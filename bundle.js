(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

/**
 * @module exports the Car class
 */
module.exports = exports = EntityManager;

/**
 * @constructor car
 * Creates a new EntityManager object
 */
function EntityManager(canvas, cellSize, callback) {
  this.cellSize = cellSize;
  this.callback = callback;
  this.xCellCount = Math.ceil(canvas.width/cellSize);
  this.yCellCount = Math.ceil(canvas.height/cellSize);
  this.entities = [];
  this.cells = [];
  for(var i = 0; i < this.xCellCount; i++){
    this.cells.push([]);
    for(var j = 0; j < this.yCellCount; j++){
      this.cells[i].push([]);
    }
  }
}

EntityManager.prototype.addEntity = function(entity) {
  // Entites are expected to have the following
  // - position.x, position.y, size.width, size.height (they should define a rect)
  // - type (a unique string represeting the object, usually the class name)
  // - render (a function to render the entity)
  // - update (a function to update the entity)
  this.entities.push(entity);
}

EntityManager.prototype.destroyAllEntitiesOfType = function(type){
  var self = this;
  var toDestroy = [];
  this.entities.forEach(function(entity){
    if(entity.type == type) toDestroy.push(entity);
  });

  toDestroy.forEach(function(entity){
    self.destroyEntity(entity);
  });
}

EntityManager.prototype.destroyEntity = function(entity){
  var idx = this.entities.indexOf(entity);
  this.entities.splice(idx, 1);
}

EntityManager.prototype.countEntitiesOfType = function(type){
  var count = 0;
  this.entities.forEach(function(entity){
    if(entity.type == type) count++;
  });
  return count;
}

EntityManager.prototype.getCell = function(entity){
  var cell =  {
    x: Math.floor(entity.position.x / this.cellSize),
    y: Math.floor(entity.position.y / this.cellSize)
  }

  if(entity.position.x < 0){
    cell.x = 0;
  }

  if(entity.position.y < 0){
    cell.y = 0;
  }
  return cell;
}

EntityManager.prototype.update = function(time, ctx){
  var self = this;

  // TODO: This is bad. I should really just move them.
  this.cells = [];
  for(var i = 0; i < this.xCellCount; i++){
    this.cells.push([]);
    for(var j = 0; j < this.yCellCount; j++){
      this.cells[i].push([]);
    }
  }

  this.entities.forEach(function(entity){
    var cell = self.getCell(entity);
    self.cells[cell.x][cell.y].push(entity);
  });

  this.entities.forEach(function(entity){
    var cellsToCheck = []
    var currentCell = self.getCell(entity);

    cellsToCheck.push(currentCell);
    if(currentCell.x + 1 < self.xCellCount){
      cellsToCheck.push({x: currentCell.x + 1, y: currentCell.y});
    }
    if(currentCell.y + 1 < self.yCellCount){
      cellsToCheck.push({x: currentCell.x, y: currentCell.y + 1});
    }
    if(currentCell.x + 1 < self.xCellCount && currentCell.y + 1 < self.yCellCount){
      cellsToCheck.push({x: currentCell.x + 1, y: currentCell.y + 1});
    }

    cellsToCheck.forEach(function(cell){
      self.cells[cell.x][cell.y].forEach(function(entity2){
        if(entity === entity2) return;
        if(collision(entity, entity2)) self.callback(entity, entity2);
      });
    });
  });

  this.entities.forEach(function(entity){
    entity.update(time);
  });

}

EntityManager.prototype.render = function(time, ctx){
  if(window.debug){
    ctx.strokeStyle = "blue";

    for(var i = 0; i < this.xCellCount; i++){
      for(var j = 0; j < this.yCellCount; j++){
        ctx.beginPath();
        ctx.rect(i * this.cellSize, j * this.cellSize, this.cellSize, this.cellSize);
        ctx.stroke();
      }
    }
  }

  this.entities.forEach(function(entity){
    entity.render(time, ctx);
  });
}

function collision(entity1, entity2){
  return !(
    (entity1.position.y + entity1.size.height < entity2.position.y) ||
    (entity1.position.y > entity2.position.y + entity2.size.height) ||
    (entity1.position.x > entity2.position.x + entity2.size.width) ||
    (entity1.position.x + entity1.size.width < entity2.position.x))
}

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

module.exports = exports = ProgressManager;

// callbackProgress( self, percent complete)
// callbackComplete( self)

function ProgressManager(length, callbackProgress, callbackComplete) {
  this.progressTimer = 0;
  this.progressLength = length;
  this.isProgressing = true;
  this.callbackProgress = callbackProgress;
  this.callbackComplete = callbackComplete;
  this.isActive = false;
}

ProgressManager.prototype.progress = function(time){
  if(!this.isActive) return;
  if(this.isProgressing){
    this.progressTimer += time;
    this.percent = this.progressTimer / this.progressLength;
    if(this.percent > 1){
      this.percent = 1;
      this.isProgressing = false;
      this.callbackComplete(this);
    }
    else {
      this.callbackProgress(this, this.percent);
    }
  }
}

ProgressManager.prototype.reset = function(){
  this.progressTimer = 0;
  this.isProgressing = true;
  this.isActive = false;
}

},{}],4:[function(require,module,exports){
"use strict";

module.exports = exports = ResourceManager

function ResourceManager(callback) {
  this.callback = callback;
  this.resourcesToLoad = 0;
  this.images = {};
  this.audio = {};
}

function onLoad(em) {
  em.resourcesToLoad--;
  if(em.resourcesToLoad == 0) em.callback();
}

ResourceManager.prototype.addImage = function(url) {
  if(this.images[url]) return this.images[url];
  this.resourcesToLoad++;
  var self = this;
  this.images[url] = new Image();
  this.images[url].onload = function() {onLoad(self);}
}

ResourceManager.prototype.addAudio = function(url) {
  if(this.audio[url]) return this.audio[url];
  this.resourcesToLoad++;
  var self = this;
  this.audio[url] = new Audio();
  this.audio[url].onloadeddata = function() {onLoad(self);}
}

ResourceManager.prototype.getResource = function(url) {
    if(this.images[url]) return this.images[url];
    if(this.audio[url]) return this.audio[url];
}

ResourceManager.prototype.loadAll = function() {
  var self = this;
  Object.keys(this.images).forEach(function(url){
    self.images[url].src = url;
  });
  Object.keys(this.audio).forEach(function(url){
    self.audio[url].src = url;
  });
}

},{}],5:[function(require,module,exports){
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

},{"./EntityManager.js":1,"./PhysicsManager.js":2,"./ProgressManager.js":3,"./ResourceManager.js":4,"./asteroid.js":6,"./game.js":8,"./hud.js":9,"./player.js":10}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

/**
 * @module exports the Game class
 */
module.exports = exports = Game;

/**
 * @constructor Game
 * Creates a new game object
 * @param {canvasDOMElement} screen canvas object to draw into
 * @param {function} updateFunction function to update the game
 * @param {function} renderFunction function to render the game
 */
function Game(screen, updateFunction, renderFunction) {
  this.update = updateFunction;
  this.render = renderFunction;

  // Set up buffers
  this.frontBuffer = screen;
  this.frontCtx = screen.getContext('2d');
  this.backBuffer = document.createElement('canvas');
  this.backBuffer.width = screen.width;
  this.backBuffer.height = screen.height;
  this.backCtx = this.backBuffer.getContext('2d');

  // Start the game loop
  this.oldTime = performance.now();
  this.paused = false;
}

/**
 * @function pause
 * Pause or unpause the game
 * @param {bool} pause true to pause, false to start
 */
Game.prototype.pause = function(flag) {
  this.paused = (flag == true);
}

/**
 * @function loop
 * The main game loop.
 * @param{time} the current time as a DOMHighResTimeStamp
 */
Game.prototype.loop = function(newTime) {
  var game = this;
  var elapsedTime = newTime - this.oldTime;
  this.oldTime = newTime;

  if(!this.paused) this.update(elapsedTime);
  this.render(elapsedTime, this.frontCtx);

  // Flip the back buffer
  this.frontCtx.drawImage(this.backBuffer, 0, 0);
}

},{}],9:[function(require,module,exports){
"use strict";

/**
 * @module exports the Hud class
 */
module.exports = exports = Hud;

/**
 * @constructor Hud
 * Creates a new Hud object
 */
function Hud(player, canvasWidth, canvasHeight) {
  var widthMultiTop = 0.6;
  var widthMultiBottom = 0.3;
  this.player = player;

  // Top Hud
  this.top = {};
  this.top.width = canvasWidth * widthMultiTop;
  this.top.height = 32;
  this.top.x = canvasWidth * ((1 - widthMultiTop)/2);
  this.top.y = 0;

  // Bottom Hud
  this.bottom = {};
  this.bottom.width = canvasWidth * widthMultiBottom;
  this.bottom.height = 32;
  this.bottom.x = canvasWidth * ((1 - widthMultiBottom)/2);
  this.bottom.y = canvasHeight - this.bottom.height;
}

/**
 * @function updates the Hud object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Hud.prototype.update = function(time) {
}

/**
 * @function renders the Hud into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Hud.prototype.render = function(time, ctx) {
  var cornerRadius = 50;
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = "white";

  // Draw Top Hud
  ctx.beginPath();
  ctx.moveTo(this.top.x + cornerRadius, this.top.y + this.top.height);
  ctx.lineTo(this.top.x + this.top.width - cornerRadius, this.top.y + this.top.height);
  ctx.arc(this.top.x + this.top.width - cornerRadius, this.top.y, this.top.height, 0.5*Math.PI, 0, true);
  ctx.lineTo(this.top.x, this.top.y);
  ctx.arc(this.top.x + cornerRadius, this.top.y, this.top.height, Math.PI, 0.5 * Math.PI, true);
  ctx.fill();

  // Draw Bottom Hud
  ctx.beginPath();
  ctx.moveTo(this.bottom.x + cornerRadius, this.bottom.y);
  ctx.lineTo(this.bottom.x + this.bottom.width - cornerRadius, this.bottom.y);
  ctx.arc(this.bottom.x + this.bottom.width - cornerRadius, this.bottom.y + this.bottom.height, this.bottom.height, 1.5*Math.PI, 0);
  ctx.lineTo(this.bottom.x, this.bottom.y + this.bottom.height);
  ctx.arc(this.bottom.x + cornerRadius, this.bottom.y + this.bottom.height, this.bottom.height, Math.PI, 1.5 * Math.PI);
  ctx.fill();

  ctx.restore();

  var centerX = this.bottom.x + (this.bottom.width / 2);
  var center1QX = this.bottom.x + (this.bottom.width / 4);
  var center3QX = this.bottom.x + (this.bottom.width / 4) * 3;
  var bottomCenterY = this.bottom.y + (this.bottom.height / 2);
  var topCenterY = this.top.y + (this.top.height / 2);

  ctx.fillStyle = "white";
  ctx.font = "bold 24px Arial";
  ctx.textAlign="center";

  ctx.fillText("Level: " + this.player.level, center1QX, topCenterY + 10)
  ctx.fillText("Score: " + this.player.score, center3QX, topCenterY + 10 );

  // Draw Ships
  for(var i = 0; i < 3; i++){
    ctx.save();
    ctx.strokeStyle = 'white';
    ctx.translate(centerX + (i * 40) - 40, bottomCenterY);
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(-10, 10);
    ctx.lineTo(0, 0);
    ctx.lineTo(10, 10);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  // Draw x's for dead ships
  for(var i = 0; i < (3 - this.player.lives); i++){
    ctx.save();
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 3;
    ctx.translate(centerX + (i * 40) - 40, bottomCenterY);
    ctx.beginPath();
    ctx.moveTo(-15, -15);
    ctx.lineTo(15, 15);
    ctx.moveTo(-15, 15);
    ctx.lineTo(15, -15);
    ctx.stroke();
    ctx.restore();
  }


}

},{}],10:[function(require,module,exports){
"use strict";

const MS_PER_FRAME = 1000/8;
const Bullet = require('./bullet.js');

/**
 * @module exports the Player class
 */
module.exports = exports = Player;

/**
 * @constructor Player
 * Creates a new player object
 * @param {Postition} position object specifying an x and y
 */
function Player(position, canvas, entityManager) {
  this.worldWidth = canvas.width;
  this.worldHeight = canvas.height;
  this.state = "idle";
  this.isColliding = false;
  this.type = 'player';
  this.score = 0;
  this.level = 0;
  this.lives = 3;
  this.entityManager = entityManager;
  this.staring = {
    x: position.x,
    y: position.y
  };
  this.position = {
    x: position.x,
    y: position.y
  };
  this.size = {
    width: 20,
    height: 20
  }
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
  this.radius  = 64;
  this.thrusting = false;
  this.steerLeft = false;
  this.steerRight = false;

  var self = this;
  window.onkeydown = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = true;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = true;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = true;
        break;
      case 'f':
        console.log('warp');
        self.warp();
        break;
    }

    if(event.keyCode == 32){
      self.entityManager.addEntity(new Bullet(self.position, self.angle, canvas, entityManager));
    }
  }


  window.onkeyup = function(event) {
    switch(event.key) {
      case 'ArrowUp': // up
      case 'w':
        self.thrusting = false;
        break;
      case 'ArrowLeft': // left
      case 'a':
        self.steerLeft = false;
        break;
      case 'ArrowRight': // right
      case 'd':
        self.steerRight = false;
        break;
    }
  }
}

/**
 * @function updates the player object
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 */
Player.prototype.update = function(time) {
  // Apply angular velocity
  if(this.steerLeft) {
    this.angle += 0.1;
  }
  if(this.steerRight) {
    this.angle -= 0.1;
  }
  // Apply acceleration
  if(this.thrusting) {
    var acceleration = {
      x: Math.sin(this.angle) * 0.1,
      y: Math.cos(this.angle) * 0.1
    }
    this.velocity.x -= acceleration.x;
    this.velocity.y -= acceleration.y;
  }
  // Apply velocity
  this.position.x += this.velocity.x;
  this.position.y += this.velocity.y;
  // Wrap around the screen
  if(this.position.x < 0) this.position.x += this.worldWidth;
  if(this.position.x > this.worldWidth) this.position.x -= this.worldWidth;
  if(this.position.y < 0) this.position.y += this.worldHeight;
  if(this.position.y > this.worldHeight) this.position.y -= this.worldHeight;

}

Player.prototype.resetToCenter = function(){
  this.position = {
    x: this.staring.x,
    y: this.staring.y
  };
  this.velocity = {
    x: 0,
    y: 0
  }
  this.angle = 0;
}

Player.prototype.warp = function(){
  this.position = {
    x: Math.floor((Math.random() * this.worldWidth)),
    y: Math.floor((Math.random() * this.worldHeight))
  };
  this.velocity = {
    x: 0,
    y: 0
  }
}

/**
 * @function renders the player into the provided context
 * {DOMHighResTimeStamp} time the elapsed time since the last frame
 * {CanvasRenderingContext2D} ctx the context to render into
 */
Player.prototype.render = function(time, ctx) {
  ctx.save();

  // Draw player's ship
  ctx.strokeStyle = 'white';
  ctx.translate(this.position.x, this.position.y);
  ctx.rotate(-this.angle);
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(-10, 10);
  ctx.lineTo(0, 0);
  ctx.lineTo(10, 10);
  ctx.closePath();
  ctx.stroke();

  // Draw engine thrust
  if(this.thrusting) {
    ctx.beginPath();
    ctx.moveTo(0, 20);
    ctx.lineTo(5, 10);
    ctx.arc(0, 10, 5, 0, Math.PI, true);
    ctx.closePath();
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  }

  if(window.debug){
    ctx.beginPath();
    ctx.strokeStyle = (this.isColliding) ? 'red' : 'green';
    ctx.rect(-10, -10, this.size.width, this.size.height);
    ctx.stroke();
  }

  this.isColliding = false;

  ctx.restore();
}

},{"./bullet.js":7}]},{},[5]);

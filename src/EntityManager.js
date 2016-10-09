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
  this.entities.push(entity);
}

EntityManager.prototype.destroyEntity = function(entity){
  var idx = this.entities.indexOf(entity);
  this.entities.splice(idx, 1);
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

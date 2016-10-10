"use strict";

module.exports = exports = AudioManager;

function AudioManager(resourceManager) {
  this.AudioClip = {
    Laser: 0,
    AsteroidCollision: 1,
    ShipDestruction: 2
  };

  this.clips = [
    resourceManager.getResource('assets/laser.wav'),
    resourceManager.getResource('assets/asteroid_collision.wav'),
    resourceManager.getResource('assets/ship_destruction.wav')
  ]
}

AudioManager.prototype.play = function(audioClip){
  this.clips[audioClip].play();
}

const {vec2, vec4, vec3} = require('./VMath.js')
require('./Engine.js');

class TestGame extends Engine.Game {
  init(){

  }

  update(deltaTime){

  }

  draw(deltaTime) {
    Graphics.rawLine(new vec2(.10, .10), new vec2(.30, .30), new vec2(2,2), new vec2(2,2), new vec4(1.0,1.0,1.0,1.0), .005);
    // Graphics.vertices[Graphics.vertexCount].color = new vec4(1.0,0.0,0.0,1.0);
    // Graphics.vertices[Graphics.vertexCount++].pos = new vec3(0.2,0.2,0);
    // Graphics.vertices[Graphics.vertexCount].color = new vec4(1.0,0.0,0.0,1.0);
    // Graphics.vertices[Graphics.vertexCount++].pos = new vec3(0.2,0.4,0);
    // Graphics.vertices[Graphics.vertexCount].color = new vec4(1.0,0.0,0.0,1.0);
    // Graphics.vertices[Graphics.vertexCount++].pos = new vec3(0.4,0.4,0);
    // Graphics.indices[0] = 0;
    // Graphics.indices[1] = 2;
    // Graphics.indices[2] = 1;
    // Graphics.indexCount += 3;
  }
}

Engine.start(new TestGame());

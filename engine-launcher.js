const {vec2, vec4, vec3, cvec, mat3} = require('./VMath.js')
require('./Engine.js');

class TestGame extends Engine.Game {

  points = new cvec(vec2, 6);
  pos = new vec2(0,0);
  angle = 0;

  init(){
    console.log("init");

  }

  update(deltaTime){
    // console.log('update');
  }

  draw(deltaTime) {
    this.pos = this.pos.add(vec2.randomUnit());
    this.angle += 360 * deltaTime;
    for (let i = 0; i < 6; i ++) {
      let angle = (360 / 6) * i - this.angle;
      this.points[i] = new vec2(100,0).rotate(-angle * Math.PI / 180).add(this.pos);
    }

    let time = Number(process.hrtime.bigint() / 1000000n) / 10000;

    // Graphics.noFill();
    // Graphics.noStroke();

    //Text tests:
    // Graphics.fillColor(new vec4(1,0.5,0.0,1.0));
    // Graphics.strokeColor(new vec4(0.0,1,1, 1.0));
    // Graphics.strokeWeight(2);
    // Graphics.text("e", 0,0);
    //-------------------------

    //Transform tests
    // let point = new vec2(100,0);
    // let transform1 = new mat3(1).rotate(45 * Math.PI / 180).scale(2,2);
    // let transform2 = new mat3(1).scale(2,2).rotate(45 * Math.PI / 180);
    // Graphics.rawLineList([new vec2(0,0), point], new vec4(0.5,0.5,0.5,1.0), 2, false);
    // let tpoint1 = transform1.mult(point);
    // let tpoint2 = transform2.mult(point);
    // Graphics.rawLineList([new vec2(0,0), tpoint1], new vec4(1,1,0,1.0), 2, false);
    // Graphics.rawLineList([new vec2(0,0), tpoint2], new vec4(0,1,1,1.0), 2, false);
    // Graphics.strokeWeight(1);
    // Graphics.strokeColor(new vec4(1,0,0,1));
    // Graphics.beginPath();
    // Graphics.moveTo(0,0);
    // Graphics.bezierCurveTo(0,200, 200, 200, 200, 0);
    // Graphics.closePath();
    // Graphics.stroke();
    Graphics.strokeWeight(1)
    Graphics.fillColor(new vec4(1,0,0,1))
    Graphics.translate(100, 200);
    Graphics.beginPath();
    Graphics.moveTo(0,0);
    Graphics.arc(0,0,10,0,2*Math.PI, false);
    Graphics.fill();
    Graphics.restore();
    Graphics.fillColor(new vec4(.5,.5,.5,1));
    Graphics.fill();

    // Graphics.beginPath();
    // Graphics.moveTo(-100,0);
    // // Graphics.bezierCurveTo(-100, 200, 100, -200, 100, 0);
    // // Graphics.bezierCurveTo(-100, 200, 100, -200, 100, 0);
    // // Graphics.bezierCurveTo(-100, 200, 100, -200, 100, 0);
    // // Graphics.bezierCurveTo(-100, 100, 100, -200, 100, 0);
    // // Graphics.bezierCurveTo(-100, -100, 100, -200, 100, 0);
    // // Graphics.arc(0,0,200,0,1.5 * Math.PI);
    // // Graphics.fill();
    // Graphics.fill();
    // Graphics.rectangle(-30, 30, 60, 60);
    // this.points[0] = this.points[0].add(vec2.randomUnit());
    // this.points[1] = this.points[1].add(vec2.randomUnit());
    // this.points[2] = this.points[2].add(vec2.randomUnit());
    // Graphics.rawLineList([new vec2(100, 100), new vec2(300, 300), new vec2(50,30)], new vec4(0.8,0,0,1.0), 5, false);
    // Graphics.rawLineList(this.points, new vec4(0.0,0.8,0.0,1.0), 5, true);
    // Graphics.rawLine(new vec2(10, 50), new vec2(30, 80), new vec2(2,2), new vec2(2,2), new vec4(1.0,0.0,1.0,1.0), 5);
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

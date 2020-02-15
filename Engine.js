require('./Graphics.js');

class EngineClass {
  Game = class Game {
    constructor(){

    }

    update(deltaTime){

    }

    draw(deltaTime){

    }

    init(){

    }

    cleanup() {

    }
  }

  game = new this.Game();

  constructor(){
    this.mainLoop = this.mainLoop.bind(this);

  }

  async start(game) {
    if (game) {
      if (game instanceof Engine.Game) {
        this.game = game;
      } else throw new TypeError("Engine: start() expects argument 1 to be of type Game. Got '" + game.constructor.name + "'.")
    }
    await this.init();
    this.run();
  }

  async init() {
    await Graphics.init();
    await this.game.init();
  }

  run() {
    this.startTime = process.hrtime.bigint();
    this.currentTime = this.startTime;
    process.on('exit', this.cleanup);
    process.on('uncaughtException', e=>console.log(e));
    this.mainLoop();
    // process.on('beforeExit', this.keepRunning)
  }

  // keepRunning(code){
  //   if (code == 0 && !Engine.win.shouldClose()) {
  //     setTimeout(this.waitFunc,1);
  //     console.log("Keeping the process running.");
  //   }
  // }

  waitFunc(){

  }

  stop(){

  }

  mainLoop() {
    this.previousTime = this.currentTime;
    this.currentTime = process.hrtime.bigint();
    // console.log("Times: ", this.previousTime, this.currentTime);
    let deltaTime = Number(this.currentTime - this.previousTime) / 1e9;
    // console.log(deltaTime);
    Graphics.drawFrame(deltaTime);
    Graphics.win.pollEvents();
    if (!Graphics.win.shouldClose()) setTimeout(this.mainLoop, 0);
  }

  cleanup() {
    Graphics.cleanup();
  }



}

global.Engine = new EngineClass();

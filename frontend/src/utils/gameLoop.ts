type LoopCallback = (dt: number) => void;


export class GameLoop {
  private loopCb: LoopCallback;
  private lastTime: number = 0;
  private running = false;

  constructor(loopCallback: LoopCallback) {
    this.loopCb = loopCallback;
  }

  run = () => {
    this.running = true;
    this.lastTime = performance.now();

    const cb = (currentTime: number) => {
      const dt = currentTime - this.lastTime;
      this.lastTime = currentTime;

      this.loopCb(dt);

      if (this.running) {
        requestAnimationFrame(cb);
      }
    };

    requestAnimationFrame(cb);
  };

  stop = () => {
    this.running = false;
  };
}

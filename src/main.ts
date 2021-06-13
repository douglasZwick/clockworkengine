import P5 from "p5"
import Engine, { IM } from "./Engine"
import { ImMode } from "./InputMaster"
import { TestScene } from "./Scene"


var canvasW = 640;
var canvasH = 360;
var clearColor: P5.Color;

export var G: P5;


const sketch = (p5: P5) =>
{
  G = p5;

  const engine = new Engine();

  p5.setup = function()
  {
    p5.createCanvas(canvasW, canvasH, p5.WEBGL);

    let testScene = new TestScene();
    engine.Space.Load(testScene);
    
    clearColor = G.color(40);
    
    p5.frameRate(60);
  }
  
  p5.draw = function()
  {
    p5.background(clearColor);

    engine.Update(dt());
  }

  p5.keyPressed = function ()
  {
    if (IM.Mode !== ImMode.Replay)
      IM.Curr[G.keyCode] = true;

    return false;
  }
  
  p5.keyReleased = function ()
  {
    if (IM.Mode !== ImMode.Replay)
      IM.Curr[G.keyCode] = false;
    
    return false;
  }

  function dt() { return p5.deltaTime / 1000; }
}

new P5(sketch)


// OVERALL TODO:
//   - If things are suspiciously slow, maybe I need to override P5.Vector.prototype.copy

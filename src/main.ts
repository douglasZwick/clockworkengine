import P5 from "p5"
import Engine, { IM } from "./Engine"
import { ImMode } from "./InputMaster"
import { TestScene } from "./Scene"


var canvasW = 640;
var canvasH = 360;
var clearColor: P5.Color;

export var G: P5;

var heroX = 0;
var heroY = 0;
var img: P5.Image;


const sketch = (p5: P5) =>
{
  G = p5;

  var engine: Engine;

  p5.preload = function()
  {
    console.log("Now preloading");
    engine = new Engine();
    engine.LoadResources().then(() =>
    {
      p5.draw = function ()
      {
        p5.background(clearColor);

        engine.Update();
      }
    });
    img = p5.loadImage("/src/Images/TestSprite.png");
  }

  p5.setup = function()
  {
    p5.createCanvas(canvasW, canvasH, p5.WEBGL);
    // p5.createCanvas(canvasW, canvasH);

    let testScene = new TestScene();
    engine.Space.Load(testScene);
    
    clearColor = G.color(100);
    
    p5.frameRate(60);
  }

  // p5.draw = function ()
  // {
  //   p5.background(clearColor);

  //   p5.push();
  //   for (let i = 0; i < 10; ++i)
  //   {
  //     for (let j = 0; j < 10; ++j)
  //     {
  //       p5.tint(255, 255, 255, 100);
  //       p5.image(img, -canvasW/2 + i * 16, -canvasH/2 + j * 16);
  //     }
  //   }
  //   p5.pop();

  //   let movement = p5.createVector();
  //   if (p5.keyIsDown(p5.RIGHT_ARROW))
  //     movement.x += 1;
  //   if (p5.keyIsDown(p5.LEFT_ARROW))
  //     movement.x -= 1;
  //   if (p5.keyIsDown(p5.DOWN_ARROW))
  //     movement.y += 1;
  //   if (p5.keyIsDown(p5.UP_ARROW))
  //     movement.y -= 1;
  //   movement = movement.normalize().mult(8 * 32 * p5.deltaTime / 1000);
  //   heroX += movement.x;
  //   heroY += movement.y;

  //   p5.tint(255, 255, 0, 255);
  //   p5.image(img, heroX, heroY);
  // }

  p5.keyPressed = function ()
  {
    return IM.OnKeyPressed(G.keyCode);
  }
  
  p5.keyReleased = function ()
  {
    return IM.OnKeyReleased(G.keyCode);
  }
}

new P5(sketch)


// OVERALL TODO:
//   - If things are suspiciously slow, maybe I need to override P5.Vector.prototype.copy

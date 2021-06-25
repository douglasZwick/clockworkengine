import P5 from "p5";
import Engine from "./Engine";
import Graphical from "./Graphical";
import ImageSource from "./ImageSource";
import { G } from "./main"


export default class Sprite extends Graphical
{
  ImageSource: ImageSource;
  FlipX: boolean = false;
  FlipY: boolean = false;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Render()
  {
    G.push();

    if (this.FlipX)
      G.scale(-1, 1, 1);
    if (!this.FlipY)
      G.scale(1, -1, 1);
    
    let w = this.ImageSource.W * Engine.Meter;
    let h = this.ImageSource.H * Engine.Meter;
    G.image(this.ImageSource.Image, 0, 0, w, h);

    G.pop();
  }
}
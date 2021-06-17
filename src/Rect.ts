import Engine from "./Engine";
import { G } from "./main";
import PrimitiveShape from "./PrimitiveShape";


// Rectangular Graphical with stroke and fill
export class Rect extends PrimitiveShape
{
  // Width
  W: number = 1;
  // Height
  H: number = 1;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Render()
  {
    if (this.UseFill)
      G.fill(this.Fill);
    else
      G.noFill();

    if (this.UseStroke)
    {
      G.stroke(this.Stroke);
      G.strokeWeight(this.StrokeWeight * Engine.Meter);
    }
    else
    {
      G.noStroke();
    }

    G.rectMode(G.CENTER);
    let w = (this.W) * Engine.Meter;
    let h = (this.H) * Engine.Meter;
    G.rect(0, 0, w, h);
  }
}

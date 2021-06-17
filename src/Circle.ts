import Engine from "./Engine";
import { G } from "./main";
import PrimitiveShape from "./PrimitiveShape";


export default class Circle extends PrimitiveShape
{
  Radius: number = 0.5;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  get Diameter() { return this.Radius * 2; }
  get W() { return this.Diameter; }
  get H() { return this.Diameter; }


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

    G.circle(0, 0, this.Diameter * Engine.Meter);
  }
}

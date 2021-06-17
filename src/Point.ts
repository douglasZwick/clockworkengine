import Engine from "./Engine";
import { G } from "./main";
import PrimitiveShape from "./PrimitiveShape";


// Very simple Graphical: just a spot of color
export default class Point extends PrimitiveShape
{
  // The width and height of this point in METERs
  Diameter: number = 1;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Convenience accessors
  get Radius()  { return this.Diameter / 2; }
  set Radius(r) { this.Diameter = 2 * r; }
  get Color()   { return this.Stroke; }
  set Color(c)  { this.Stroke = c; }

  Render()
  {
    G.stroke(this.Stroke);       // Points are drawn with stroke color
    G.strokeWeight(this.Diameter * Engine.Meter);
    G.point(0, 0);
  }
}

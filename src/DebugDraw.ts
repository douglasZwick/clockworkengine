import P5 from "p5"
import Engine from "./Engine"
import { G } from "./main"


// TODO:
//   Refactor this and PrimitiveShape to have some shared thing
export class DebugShape
{
  // Interior color for rect/ellipse/circle/text, maybe others?
  Fill: P5.Color = G.color(255);
  // Stroke color
  Stroke: P5.Color = G.color(255);
  // Whether this should be drawn with a stroke
  UseStroke: boolean = false;
  // Whether this should be drawn filled
  UseFill: boolean = true;
  // The thickness of the stroke to be used (in screen units!)
  StrokeWeight: number = 0;

  constructor(fill: P5.Color, stroke: P5.Color,
    useStroke: boolean, useFill: boolean, strokeWeight: number)
  {
    this.Fill = fill;
    this.Stroke = stroke;
    this.UseStroke = useStroke;
    this.UseFill = useFill;
    this.StrokeWeight = strokeWeight;
  }

  Render() {}
}


export class DebugRect extends DebugShape
{
  // World position in meters
  Position: P5.Vector;
  // Width in meters
  W: number;
  // Height in meters
  H: number;

  constructor(position: P5.Vector, w: number, h: number, fill: P5.Color, stroke: P5.Color,
    useStroke: boolean, useFill: boolean, strokeWeight: number)
  {
    super(fill, stroke, useStroke, useFill, strokeWeight);

    this.Position = position;
    this.W = w;
    this.H = h;
  }

  Render()
  {
    G.push();

    if (this.UseFill)
      G.fill(this.Fill);
    else
      G.noFill();

    if (this.UseStroke)
    {
      G.stroke(this.Stroke);
      G.strokeWeight(this.StrokeWeight);
    }
    else
    {
      G.noStroke();
    }

    G.rectMode(G.CENTER);
    let x = this.Position.x * Engine.Meter;
    let y = this.Position.y * Engine.Meter;
    let w = this.W * Engine.Meter;
    let h = this.H * Engine.Meter;
    G.rect(x, y, w, h);

    G.pop();
  }
}


export class DebugLine extends DebugShape
{
  // TODO:
  //   Add arrow options

  Start: P5.Vector;
  End: P5.Vector;

  constructor(start: P5.Vector, end: P5.Vector, color: P5.Color, thickness: number)
  {
    super(G.color(0, 0), color, true, false, thickness);

    this.Start = start;
    this.End = end;
  }

  Render()
  {
    G.push();

    G.stroke(this.Stroke);
    G.strokeWeight(this.StrokeWeight);
    G.line(this.Start.x * Engine.Meter, this.Start.y * Engine.Meter,
           this.End.x   * Engine.Meter, this.End.y   * Engine.Meter);

    G.pop();
  }
}


export class DebugPoint extends DebugShape
{
  Position: P5.Vector;

  constructor(position: P5.Vector, color: P5.Color, radius: number)
  {
    super(G.color(0, 0), color, true, false, radius * 2);

    this.Position = position;
  }

  Render()
  {
    G.push();

    G.stroke(this.Stroke);       // Points are drawn with stroke color
    G.strokeWeight(this.StrokeWeight);
    let x = this.Position.x * Engine.Meter;
    let y = this.Position.y * Engine.Meter;
    G.point(x, y);

    G.pop();
  }
}

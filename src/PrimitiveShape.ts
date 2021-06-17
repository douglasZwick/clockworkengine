import P5 from "p5"
import Graphical from "./Graphical";
import { G } from "./main";


// Represents all the shapes of p5 that I care to implement here
export default class PrimitiveShape extends Graphical
{
  // Interior color for rect/ellipse/circle/text, maybe others?
  Fill: P5.Color = G.color(255);
  // Stroke color
  Stroke: P5.Color = G.color(255);
  // Whether this should be drawn with a stroke
  UseStroke: boolean = false;
  // Whether this should be drawn filled
  UseFill: boolean = true;
  // The thickness of the stroke to be used (in METERs)
  StrokeWeight: number = 0;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }
}
import P5 from "p5"
import Component from "./Component";
import { G } from "./main";


// Base Graphical class. Stuff you can see
export default class Graphical extends Component
{
  // Which graphical layer should this use?
  Layer: number = 0;
  // Offset vector, applied to the Tx position before drawing
  _Offset: P5.Vector = G.createVector();

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Access _Offset by copy
  get Offset() { return this._Offset.copy(); }
  // Access _Offset by copy
  set Offset(offset) { this._Offset = offset.copy(); }

  // Add this Graphical to the GraphicsSystem
  Initialize()
  {
    super.Initialize();

    this.Space.GraphicsSystem.Add(this);
  }

  // Override this to draw this Graphical with p5 calls
  Render() { }

  // Remove this Graphical from the GraphicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp()
  {
    this.Space.GraphicsSystem.Remove(this);
  }
}

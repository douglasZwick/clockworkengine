import P5 from "p5"
import Component from "./Component";
import { G } from "./main";


// Short for "Transform". Keeps track of this Cog's
//   position, rotation, and scale in space
export default class Tx extends Component
{
  _Position: P5.Vector = G.createVector();
  Rotation: number = 0;
  Scale: P5.Vector = G.createVector();

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Access _Position by copy
  get Position() { return this._Position.copy(); }
  get X() { return this._Position.x; }
  get Y() { return this._Position.y; }
  
  // Access _Position by copy
  set Position(pos) { this._Position = pos.copy(); }
  set X(x) { this._Position.x = x; }
  set Y(y) { this._Position.y = y; }

  Add(vec: P5.Vector): P5.Vector
  {
    return this._Position.add(vec);
  }

  AddX(x: number)
  {
    this.X += x;
  }

  AddY(y: number)
  {
    this.Y += y;
  }
}

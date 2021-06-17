import Collider from "./Collider";
import { G } from "./main"


// Axis-aligned bounding box collider
export default class AabbCollider extends Collider
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

  // Getters for this Collider's extents in the world
  get Left() { return this.Tx.X + this._Offset.x - this.W / 2; }
  get Right() { return this.Tx.X + this._Offset.x + this.W / 2; }
  get Bottom() { return this.Tx.Y + this._Offset.y - this.H / 2; }
  get Top() { return this.Tx.Y + this._Offset.y + this.H / 2; }

  DebugDraw()
  {
    this.Space.DebugRect(this.Tx.Position,
      this.W, this.H, null, G.color(0, 250, 255),
      true, false, 2);
  }
}

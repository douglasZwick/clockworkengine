import Collider from "./Collider";
import { G } from "./main"


export default class CircleCollider extends Collider
{
  Radius: number = 0.5;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  DebugDraw()
  {
    this.Space.DebugCircle(this.Tx.Position,
      this.Radius, null, G.color(0, 250, 255),
      true, false, 2);
  }
}
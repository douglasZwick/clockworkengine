import P5 from "p5";
import PrimitiveShape from "./PrimitiveShape";
import Component from "./Component";
import { G } from "./main";
import { Collision } from "./PhysicsSystem";


export default class ChangeColorOnCollision extends Component
{
  Shape: PrimitiveShape = null;
  DefaultColor: P5.Color = G.color(255);
  ActiveColor: P5.Color = G.color(250, 20, 50);

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Initialize()
  {
    this.Shape = this.Owner.Get(PrimitiveShape);
    this.DefaultColor = this.Shape.Fill;
  }

  CollisionStarted(collision: Collision)
  {
    this.Shape.Fill = this.ActiveColor;
  }

  CollisionEnded(collision: Collision)
  {
    this.Shape.Fill = this.DefaultColor;
  }
}

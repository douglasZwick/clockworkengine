import Component from "./Component";
import { IM } from "./Engine";
import { Key } from "./InputMaster";
import { G } from "./main";


// Super simple test component for all-direction keyboard movement
export default class BasicMover extends Component
{
  // How fast to go in meters per second
  Speed: number = 8;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  LogicUpdate(dt: number)
  {
    if (!this.Active) return; // Don't do anything if inactive

    let movement = G.createVector();

    if (IM.Down(Key.Right))
      movement.x += 1;
    if (IM.Down(Key.Left))
      movement.x -= 1;
    if (IM.Down(Key.Up))
      movement.y += 1;
    if (IM.Down(Key.Down))
      movement.y -= 1;

    movement.normalize().mult(this.Speed * dt);

    this.Tx.Add(movement);
  }
}

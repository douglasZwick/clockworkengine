import P5 from "p5"
import Component from "./Component";
import { G } from "./main";


// Moves its Cog around in space using velocity
export default class Body extends Component
{
  _Velocity: P5.Vector = G.createVector();
  AngularVelocity: number = 0;
  _Gravity: P5.Vector = G.createVector(0, 9.81);

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Access _Velocity by copy
  get Velocity() { return this._Velocity.copy(); }
  // Access _Velocity by copy
  set Velocity(vel) { this._Velocity = vel.copy(); }
  // Access _Gravity by copy
  get Gravity() { return this._Gravity.copy(); }
  // Access _Gravity by copy
  set Gravity(gravity) { this._Gravity = gravity.copy(); }

  // Adds this Body to the PhysicsSystem
  Initialize()
  {
    this.Space.PhysicsSystem.AddBody(this);
  }

  // Applies numbers to other numbers!
  PhysicsUpdate(dt: number)
  {
    // Applies this Body's velocity to its Transform's position
    let dPos = P5.Vector.mult(this._Velocity, dt);
    this.Tx.Add(dPos);

    // Applies this Body's gravity to its velocity
    let dVel = P5.Vector.mult(this._Gravity, dt);
    this._Velocity.add(dVel);
  }

  // Removes this Body from the PhysicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp()
  {
    this.Space.PhysicsSystem.RemoveBody(this);
  }
}

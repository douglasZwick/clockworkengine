import { Cog } from "./Cog";
import CountedObject from "./CountedObject";
import { Collision } from "./PhysicsSystem";


// Base Component class. Highly flexible and adaptable
//   atomic nugget of gameplay goodness
export default class Component extends CountedObject
{
  Name: string;
  // Doesn't inherently do anything, but derived classes can use it
  Active: boolean = true;
  // See comments on the corresponding flag on Cog
  Initialized: boolean = false;
  // The Cog that has this Component attached to it
  Owner: Cog = null;
  
  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }
  
  // The ComponentType identifies this Component's type
  get ComponentType() { return this.constructor.name; }
  // The Space that this Component's Owner belongs to
  get Space() { return this.Owner.Space; }

  // All Components have getters for their Owner's Tx
  get Tx() { return this.Owner.Tx; }
  get X() { return this.Tx.X; }
  get Y() { return this.Tx.Y; }

  // Returns a useful string representation of this Component
  toString(): string
  {
    return `[Component|${this.ComponentType} ${this.Name}|${this.Id}]`;
  }

  // These can all be overridden to do whatever!

  // In a Component derived class:
  //   Any startup code should go in here
  Initialize() { this.Initialized = true; }
  //   Most ordinary gameplay behavior should go in here
  LogicUpdate(dt: number) { }
  //   Mostly just for Body
  PhysicsUpdate(dt: number) { }
  //   Useful for anything that should happen after physics
  LateUpdate(dt: number) { }
  //   How this component should be graphically represented for debugging
  DebugDraw() { }
  //   Add whatever you want to happen when this Cog begins touching something
  CollisionStarted(collision: Collision) { }
  //   Add whatever you want to happen when an ongoing collision continues
  CollisionPersisted(collision: Collision) { }
  //   Add whatever should happen when a previous collision ends
  CollisionEnded(collision: Collision) { }
  //   Gameplay Code that should run when this Cog is about to be destroyed
  Destroyed() { }
  //   Cleanup code (memory, references, etc) for when this Cog is being pruned
  CleanUp() { }
}

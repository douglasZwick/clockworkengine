import Space from "./Space";
import CountedObject from "./CountedObject"
import Component from "./Component"
import Tx from "./Tx"
import { Collision } from "./PhysicsSystem"


type TypeOf<T> = new (...args: any[]) => T;

// Cog is "GOC" backwards, which is Game Object Composition.
// Without Components, a Cog is nothing but a name, a unique
//   Id, and some flags.
export default class Cog extends CountedObject
{
  Name: string = "Cog";
  // This Cog's Tx component
  Tx: Tx = null;
  // The array of Components attached to this Cog
  Components: Component[] = [];
  // If true, this Cog will be pruned at the end of the frame
  Marked: boolean = false;
  // If true, this Cog will not be destroyed on scene changes
  Persistent: boolean = false;
  // False until this Cog's Initialize function is called.
  //   I currently do not remember why I wanted this....
  Initialized: boolean = false;
  // The Space that this Cog belongs to
  Space: Space = null;

  constructor(space: Space)
  {
    super();

    this.Space = space;
  }

  // Accessors for the X and Y positions of the Tx
  get X()  { return this.Tx.X; }
  set X(x) { this.Tx.X = x; }
  get Y()  { return this.Tx.Y; }
  set Y(y) { this.Tx.Y = y; }

  // Returns a useful string representation of this Cog
  toString(): string
  {
    return `[Cog ${this.Name}|${this.Id}]`;
  }

  // Attaches the given Component to this Cog
  Add(component: Component)
  {
    // Keep special track of it if it's the Tx
    if (component instanceof Tx)
      this.Tx = component;

    // Adds it to the array and sets its Owner to this Cog
    this.Components.push(component);
    component.Owner = this;
  }

  // Finds and returns the first attached Component
  //   of the given type, if any
  Get<T extends Component>(type: TypeOf<T>): T
  {
    return this.Components.find(component => component instanceof type) as T;
  }

  // Finds and returns an array of all the attached Components
  //   of the given type, if any
  GetAll<T extends Component>(type: TypeOf<T>): T[]
  {
    return this.Components.filter(component => component instanceof type) as T[];
  }

  // Finds and returns the first attached Component
  //   with the given name, if any
  Find(name: string): Component
  {
    return this.Components.find(component => component.Name === name);
  }

  // Finds and returns an array of all the attached Components
  //   with the given name, if any
  FindAll(name: string): Component[]
  {
    return this.Components.filter(component => component.Name === name);
  }

  // Initializes all this Cog's Components
  Initialize()
  {
    for (const component of this.Components)
      component.Initialize();

    this.Initialized = true;
  }

  // Updates all this Cog's Components' behaviors
  LogicUpdate(dt: number)
  {
    for (const component of this.Components)
      component.LogicUpdate(dt);
  }

  // Mostly for the Body Component, but others
  //   might care too
  // TODO:
  //   NOTHING CALLS THIS, so get rid of it??????????
  PhysicsUpdate(dt: number)
  {
    for (const component of this.Components)
      component.PhysicsUpdate(dt);
  }

  // Useful for anything that should happen after physics
  LateUpdate(dt: number)
  {
    for (const component of this.Components)
      component.LateUpdate(dt);
  }

  // Calls the DebugDraw function of each component
  //   that has it
  DebugDraw()
  {
    for (const component of this.Components)
      component.DebugDraw();
  }

  // Called on the first frame that this Cog
  //   is colliding with another Cog
  CollisionStarted(collision: Collision)
  {
    for (const component of this.Components)
      component.CollisionStarted(collision);
  }

  // Called every frame after the first that this Cog
  //   is colliding with another Cog
  CollisionPersisted(collision: Collision)
  {
    for (const component of this.Components)
      component.CollisionPersisted(collision);
  }

  // Called the first frame that this Cog
  //   is no longer colliding with another Cog
  CollisionEnded(collision: Collision)
  {
    for (const component of this.Components)
      component.CollisionEnded(collision);
  }

  // Destroys this Cog. This means "marking" it for
  //   actual destruction at the end of the frame
  Destroy()
  {
    if (this.Marked) return;

    this.Marked = true;

    for (const component of this.Components)
      component.Destroyed();
  }

  // Runs any cleanup code that this Cog's components
  //   should run when they're about to be gone for good
  CleanUp()
  {
    for (const component of this.Components)
      component.CleanUp();
  }
}

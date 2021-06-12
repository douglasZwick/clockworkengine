import P5 from "p5"
import { G } from "./main"
import Engine, { IM } from "./Engine"
import { Collision } from "./PhysicsSystem"
import Space from "./Space";
import CountedObject from "./CountedObject"
import Component from "./Component"
import Graphical from "./Graphical"
import Tx from "./Tx"
import { Contact } from "./PhysicsSystem"


// Cog is "GOC" backwards, which is Game Object Composition.
// Without Components, a Cog is nothing but a name, a unique
//   Id, and some flags.
export class Cog extends CountedObject
{
  Name: string = "Cog";
  // This Cog's Tx component
  Tx: Tx = null;
  // The array of Components attached to this Cog
  Components: Component[] = [];
  // If true, this Cog will be pruned at the end of the frame
  Marked: boolean = false;
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
  // TODO:
  //   Rewrite this function to use generics, I think they're called?
  Get(componentType: string): Component
  {
    for (const component of this.Components)
      if (component.ComponentType === componentType)
        return component;

    return null;
  }

  // Finds and returns an array of all the attached Components
  //   of the given type, if any
  GetAll(componentType: string): Component[]
  {
    let components = Array<Component>();

    for (const component of this.Components)
      if (component.ComponentType === componentType)
        components.push(component);

    return components;
  }

  // Finds and returns the first attached Component
  //   with the given name, if any
  Find(name: string): Component
  {
    for (const component of this.Components)
      if (component.Name === name)
        return component;

    return null;
  }

  // Finds and returns an array of all the attached Components
  //   with the given name, if any
  FindAll(name: string): Component[]
  {
    let components = Array<Component>();

    for (const component of this.Components)
      if (component.Name === name)
        components.push(component);

    return components;
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


// Represents all the shapes of p5 that I care to implement here
export class PrimitiveShape extends Graphical
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


// Very simple Graphical: just a spot of color
export class Point extends PrimitiveShape
{
  // The width and height of this point in METERs
  Diameter: number = 1;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Convenience accessors
  get Radius()  { return this.Diameter / 2; }
  set Radius(r) { this.Diameter = 2 * r; }
  get Color()   { return this.Stroke; }
  set Color(c)  { this.Stroke = c; }

  Render()
  {
    if (!this.Active) return;  // Invisible if inactive

    G.push();

    G.stroke(this.Stroke);       // Points are drawn with stroke color
    G.strokeWeight(this.Diameter * Engine.Meter);
    let x = (this.X + this._Offset.x) * Engine.Meter;
    let y = (this.Y + this._Offset.y) * Engine.Meter;
    G.point(x, y);

    G.pop();
  }
}


// Rectangular Graphical with stroke and fill
export class Rect extends PrimitiveShape
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

  Render()
  {
    if (!this.Active) return;  // Invisible if inactive

    G.push();

    if (this.UseFill)
      G.fill(this.Fill);
    else
      G.noFill();

    if (this.UseStroke)
    {
      G.stroke(this.Stroke);
      G.strokeWeight(this.StrokeWeight * Engine.Meter);
    }
    else
    {
      G.noStroke();
    }

    G.rectMode(G.CENTER);
    let x = (this.X + this._Offset.x) * Engine.Meter;
    let y = (this.Y + this._Offset.y) * Engine.Meter;
    let w = (this.W) * Engine.Meter;
    let h = (this.H) * Engine.Meter;
    G.rect(x, y, w, h);

    G.pop();
  }
}


// Base Collider class. Use by the PhysicsSystem to
//   check if this Cog is touching other Cogs, etc.
export class Collider extends Component
{
  // Colliders are either dynamic or static
  _Dynamic: boolean = false;
  // Applied to Tx position before collision checks
  _Offset: P5.Vector = G.createVector();
  // List of all contacts this Collider currently has with other Colliders
  Contacts: Contact[] = [];

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Interface for changing whether something is
  //   dynamic or static at runtime
  get Dynamic() { return this._Dynamic; }
  set Dynamic(dynamic)
  {
    if (this.Initialized)
    {
      if (dynamic !== this._Dynamic)
      {
        this.Space.PhysicsSystem.RemoveCollider(this);
        this._Dynamic = dynamic;
        this.Space.PhysicsSystem.AddCollider(this);
      }
    }
    else
    {
      this._Dynamic = dynamic;
    }
  }

  // Access _Offset by copy
  get Offset() { return this._Offset.copy(); }
  // Access _Offset by copy
  set Offset(offset) { this._Offset = offset.copy(); }

  // Adds this Collider to the PhysicsSystem
  Initialize()
  {
    super.Initialize();

    this.Space.PhysicsSystem.AddCollider(this);
  }

  // Adds a new contact. Called when a collision starts
  AddContact(contact: Contact)
  {
    this.Contacts.push(contact);
  }

  // Checks whether this Collider is already touching the given Collider
  ContactExistsWith(collider: Collider): boolean
  {
    let find = (contact: Contact): boolean =>
    { return contact.OtherCollider.Id === collider.Id; };

    return this.Contacts.find(find) !== undefined;
  }

  // Removes any contact that may exist with the given Collider
  PruneContactWith(collider: Collider): boolean
  {
    let find = (contact: Contact): boolean =>
    { return contact.OtherCollider.Id === collider.Id; };

    // First, find whether such a contact exists
    let index = this.Contacts.findIndex(find);

    // If nothing was found, return false
    if (index < 0)
      return false;

    // Otherwise, prune that contact from this list and return true
    this.Contacts[index] = this.Contacts[this.Contacts.length - 1];
    --this.Contacts.length;

    return true;
  }

  // Removes this Collider from the PhysicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp()
  {
    this.Space.PhysicsSystem.RemoveCollider(this);
  }
}


// Axis-aligned bounding box collider
export class AabbCollider extends Collider
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
  get Top() { return this.Tx.Y + this._Offset.y - this.H / 2; }
  get Bottom() { return this.Tx.Y + this._Offset.y + this.H / 2; }
}

// A CountedObject is anything with a unique Id
class CountedObject {
  constructor() {
    // By getting the engine's NextId,
    //   this object's Id is always unique
    this.Id = ENGINE.NextId();
  }
}


// Cog is "GOC" backwards, which is Game Object Composition.
// Without Components, a Cog is nothing but a name, a unique
//   Id, and some flags.
class Cog extends CountedObject {
  constructor() {
    super();

    this.Name = "Cog";
    // This Cog's Tx component
    this.Tx = null;
    // The array of Components attached to this Cog
    this.Components = [];
    // If true, this Cog will be pruned at the end of the frame
    this.Marked = false;
    // False until this Cog's Initialize function is called.
    //   I currently do not remember why I wanted this....
    this.Initialized = false;
  }

  // Accessors for the X and Y positions of the Tx
  get X() { return this.Tx.X; }
  set X(x) { this.Tx.X = x; }
  get Y() { return this.Tx.Y; }
  set Y(y) { this.Tx.Y = y; }

  // Returns a useful string representation of this Cog
  toString() { return `[Cog ${this.Name}|${this.Id}]`; }

  // Attaches the given Component to this Cog
  Add(component) {
    // Keep special track of it if it's the Tx
    if (component.ComponentType === "Tx")
      this.Tx = component;

    // Adds it to the array and sets its Owner to this Cog
    this.Components.push(component);
    component.Owner = this;
  }

  // Finds and returns the first attached Component
  //   of the given type, if any
  Get(componentType) {
    for (const component of this.Components)
      if (component.ComponentType === componentType)
        return component;

    return null;
  }

  // Finds and returns an array of all the attached Components
  //   of the given type, if any
  GetAll(componentType) {
    let components = [];

    for (const component of this.Components)
      if (component.ComponentType === componentType)
        components.push(component);

    return components;
  }

  // Finds and returns the first attached Component
  //   with the given name, if any
  Find(name) {
    for (const component of this.Components)
      if (component.Name === name)
        return component;

    return null;
  }

  // Finds and returns an array of all the attached Components
  //   with the given name, if any
  FindAll(name) {
    let components = [];

    for (const component of this.Components)
      if (component.Name === name)
        components.push(component);

    return components;
  }

  // Initializes all this Cog's Components
  Initialize() {
    for (const component of this.Components)
      component.Initialize();

    this.Initialized = true;
  }

  // Updates all this Cog's Components' behaviors
  LogicUpdate(dt) {
    for (const component of this.Components)
      component.LogicUpdate(dt);
  }

  // Mostly for the Body Component, but others
  //   might care too
  // TODO:
  //   NOTHING CALLS THIS, so get rid of it??????????
  PhysicsUpdate(dt) {
    for (const component of this.Components)
      component.PhysicsUpdate(dt);
  }

  // Useful for anything that should happen after physics
  LateUpdate(dt) {
    for (const component of this.Components)
      component.LateUpdate(dt);
  }

  // Calls the DebugDraw function of each component
  //   that has it
  DebugDraw() {
    for (const component of this.Components)
      component.DebugDraw();
  }

  // Called on the first frame that this Cog
  //   is colliding with another Cog
  CollisionStarted(collision) {
    for (const component of this.Components)
      component.CollisionStarted(collision);
  }

  // Called every frame after the first that this Cog
  //   is colliding with another Cog
  CollisionPersisted(collision) {
    for (const component of this.Components)
      component.CollisionPersisted(collision);
  }

  // Called the first frame that this Cog
  //   is no longer colliding with another Cog
  CollisionEnded(collision) {
    for (const component of this.Components)
      component.CollisionEnded(collision);
  }

  // Destroys this Cog. This means "marking" it for
  //   actual destruction at the end of the frame
  Destroy() {
    if (this.Marked) return;

    this.Marked = true;

    for (const component of this.Components)
      component.Destroyed();
  }

  // Runs any cleanup code that this Cog's components
  //   should run when they're about to be gone for good
  CleanUp() {
    for (const component of this.Components)
      component.CleanUp();
  }
}


// Base Component class. Highly flexible and adaptable
//   atomic nugget of gameplay goodness
class Component extends CountedObject {
  constructor() {
    super();

    this.Name = "Component";
    // Doesn't inherently do anything, but derived classes can use it
    this.Active = true;
    // See comments on the corresponding flag on Cog
    this.Initialized = false;
  }

  // The ComponentType identifies this Component's type. (Replace soon!)
  get ComponentType() { return this.constructor.name; }

  // All Components have getters for their Owner's Tx
  get Tx() { return this.Owner.Tx; }
  get X() { return this.Tx.X; }
  get Y() { return this.Tx.Y; }

  // Returns a useful string representation of this Component
  toString() { return `[Component|${this.ComponentType} ${this.Name}|${this.Id}]`; }

  // These can all be overridden to do whatever!

  // In a Component derived class:
  //   Any startup code should go in here
  Initialize() { this.Initialized = true; }
  //   Most ordinary gameplay behavior should go in here
  LogicUpdate(dt) { }
  //   Mostly just for Body
  PhysicsUpdate(dt) { }
  //   Useful for anything that should happen after physics
  LateUpdate(dt) { }
  //   How this component should be graphically represented for debugging
  DebugDraw() { }
  //   Add whatever you want to happen when this Cog begins touching something
  CollisionStarted(collision) { }
  //   Add whatever you want to happen when an ongoing collision continues
  CollisionPersisted(collision) { }
  //   Add whatever should happen when a previous collision ends
  CollisionEnded(collision) { }
  //   Gameplay Code that should run when this Cog is about to be destroyed
  Destroyed() { }
  //   Cleanup code (memory, references, etc) for when this Cog is being pruned
  CleanUp() { }
}


// Short for "Transform". Keeps track of this Cog's
//   position, rotation, and scale in space
class Tx extends Component {
  constructor() {
    super();

    this.Name = "Tx";
    this.Position = new p5.Vector();
    this.Rotation = 0;
    this.Scale = new p5.Vector();
  }

  get X() { return this.Position.x; }
  get Y() { return this.Position.y; }

  set X(x) {
    let pos = this.Position;
    pos.x = x;
    this.Position = pos;
  }

  set Y(y) {
    let pos = this.Position;
    pos.y = y;
    this.Position = pos;
  }

  Add(vec) {
    this.Position.add(vec);
  }

  AddX(x) {
    this.X += x;
  }

  AddY(y) {
    this.Y += y;
  }
}


// Base Graphical class. Stuff you can see
class Graphical extends Component {
  constructor() {
    super();

    this.Name = "Graphical";
    // Which graphical layer should this use?
    this.Layer = 0;
    // Offset vector, applied to the Tx position before drawing
    this.Offset = new p5.Vector();
  }

  // Add this Graphical to the GraphicsSystem
  Initialize() {
    super.Initialize();

    GFX.Add(this);
  }

  // Override this to draw this Graphical with p5 calls
  Render() { }

  // Remove this Graphical from the GraphicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp() {
    GFX.Remove(this);
  }
}


// Represents all the shapes of p5 that I care to implement here
class PrimitiveShape extends Graphical {
  constructor() {
    super();

    this.Name = "PrimitiveShape";
    // Interior color for rect/ellipse/circle/text, maybe others?
    this.Fill = color(255);
    // Stroke color
    this.Stroke = color(255);
    // Whether this should be drawn with a stroke
    this.UseStroke = false;
    // Whether this should be drawn filled
    this.UseFill = true;
    // The thickness of the stroke to be used (in METERs)
    this.StrokeWeight = 0;
  }
}


// Very simple Graphical: just a spot of color
class Point extends PrimitiveShape {
  constructor() {
    super();

    this.Name = "Point";
    // The width and height of this point in METERs
    this.Diameter = 1;
  }

  // Convenience accessors
  get Radius() { return this.Diameter / 2; }
  set Radius(r) { this.Diameter = 2 * r; }
  get Color() { return this.Stroke; }
  set Color(c) { this.Stroke = c; }

  Render() {
    if (!this.Active) return;  // Invisible if inactive

    push();

    stroke(this.Stroke);       // Points are drawn with stroke color
    strokeWeight(this.Diameter * METER);
    let x = (this.X + this.Offset.x) * METER;
    let y = (this.Y + this.Offset.y) * METER;
    point(x, y);

    pop();
  }
}


// Rectangular Graphical with stroke and fill
class Rect extends PrimitiveShape {
  constructor() {
    super();

    this.Name = "Rect";
    // Width
    this.W = 1;
    // Height
    this.H = 1;
  }

  Render() {
    if (!this.Active) return;  // Invisible if inactive

    push();

    if (this.UseFill)
      fill(this.Fill);
    else
      noFill();

    if (this.UseStroke) {
      stroke(this.Stroke);
      strokeWeight(this.StrokeWeight * METER);
    }
    else {
      noStroke();
    }

    rectMode(CENTER);
    let x = (this.X + this.Offset.x) * METER;
    let y = (this.Y + this.Offset.y) * METER;
    let w = (this.W) * METER;
    let h = (this.H) * METER;
    rect(x, y, w, h);

    pop();
  }
}


// Base Collider class. Use by the PhysicsSystem to
//   check if this Cog is touching other Cogs, etc.
class Collider extends Component {
  constructor() {
    super();

    this.Name = "Collider";
    // Colliders are either dynamic or static
    this._Dynamic = false;
    // Applied to Tx position before collision checks
    this.Offset = new p5.Vector();
    // List of all contacts this Collider currently has with other Colliders
    this.Contacts = [];
  }

  // Interface for changing whether something is
  //   dynamic or static at runtime
  get Dynamic() { return this._Dynamic; }
  set Dynamic(dynamic) {
    if (dynamic !== this._Dynamic) {
      PHX.RemoveCollider(this);
      this._Dynamic = dynamic;
      PHX.AddCollider(this);
    }
  }

  // Adds this Collider to the PhysicsSystem
  Initialize() {
    super.Initialize();

    PHX.AddCollider(this);
  }

  // Adds a new contact. Called when a collision starts
  AddContact(contact) {
    this.Contacts.push(contact);
  }

  // Checks whether this Collider is already touching the given Collider
  ContactExistsWith(collider) {
    return this.Contacts.find(contact => contact.OtherCollider === collider) !== undefined;
  }

  // Removes any contact that may exist with the given Collider
  PruneContactWith(collider) {
    // First, find whether such a contact exists
    let index = this.Contacts.findIndex(contact => contact.OtherCollider === collider);

    // If nothing was found, return false
    if (index < 0)
      return false;

    // Otherwise, prune that contact from this list and return true
    let contact = this.Contacts[index];
    this.Contacts[index] = this.Contacts[this.Contacts.length - 1];
    --this.Contacts.length;

    return true;
  }

  // Removes this Collider from the PhysicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp() {
    PHX.RemoveCollider(this);
  }
}


// Axis-aligned bounding box collider
class AabbCollider extends Collider {
  constructor() {
    super();

    this.Name = "AabbCollider";
    // Width
    this.W = 1;
    // Height
    this.H = 1;
  }

  // Getters for this Collider's extents in the world
  get Left() { return this.Tx.X + this.Offset.x - this.W / 2; }
  get Right() { return this.Tx.X + this.Offset.x + this.W / 2; }
  get Top() { return this.Tx.Y + this.Offset.y - this.H / 2; }
  get Bottom() { return this.Tx.Y + this.Offset.y + this.H / 2; }
}


// Moves its Cog around in space using velocity
class Body extends Component {
  constructor() {
    super();

    this.Name = "Body";
    this.Velocity = new p5.Vector();
    this.AngularVelocity = 0;
    this.Gravity = createVector(0, 9.81);
  }

  // Adds this Body to the PhysicsSystem
  Initialize() {
    PHX.AddBody(this);
  }

  // Applies numbers to other numbers!
  PhysicsUpdate(dt) {
    // Applies this Body's velocity to its Transform's position
    let dPos = p5.Vector.mult(this.Velocity, dt);
    this.Tx.Add(dPos);

    // Applies this Body's gravity to its velocity
    let dVel = p5.Vector.mult(this.Gravity, dt);
    this.Velocity.add(dVel);
  }

  // Removes this Body from the PhysicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp() {
    PHX.RemoveBody(this);
  }
}


// Super simple test component for all-direction keyboard movement
class BasicMover extends Component {
  constructor() {
    super();

    this.Name = "BasicMover";
    // How fast to go in units per second
    this.Speed = 8;
  }

  LogicUpdate(dt) {
    if (!this.Active) return; // Don't do anything if inactive

    let movement = new p5.Vector();

    if (keyIsDown(RIGHT_ARROW))
      movement.x += 1;
    if (keyIsDown(LEFT_ARROW))
      movement.x -= 1;
    if (keyIsDown(UP_ARROW))
      movement.y -= 1;
    if (keyIsDown(DOWN_ARROW))
      movement.y += 1;

    movement.normalize().mult(this.Speed * dt);

    this.Tx.Add(movement);
  }
}


// Contact info about the overlap of two colliding objects
class Contact {
  constructor() {
    // The other collider that this one is touching
    this.OtherCollider = null;
    // The world-space position of the contact
    this.Position = new p5.Vector();
    // The vector that should be applied to resolve collision
    this.ResolutionVector = new p5.Vector();
  }
}

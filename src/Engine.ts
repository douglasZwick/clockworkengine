// CLOCKWORK ENGINE
//   v. something
// 
// by Doug Zwick
// 
// Heavily inspired by the Zero Engine
//   https://github.com/zeroengineteam/ZeroCore


var ENGINE;  // global access to the engine itself
var SPACE;   // global access to the engine's Space
var PHX;     // global access to the physics system
var GFX;     // global access to the graphics system

// Defines the number of world units per logical "meter"
const METER = 32;

class Engine
{
  constructor()
  {
    ENGINE = this;
    
    // The IdCounter is used by CountedObjects to get unique ID numbers
    this.IdCounter = 0;
    
    this.Space = new Space();
    this.PhysicsSystem = new PhysicsSystem();
    this.GraphicsSystem = new GraphicsSystem();
    
    SPACE = this.Space;
    PHX = this.PhysicsSystem;
    GFX = this.GraphicsSystem;
  }
  
  // Gets the next unique ID number
  NextId() { return this.IdCounter++; }
  
  Update(dt)
  {
    // Update the behavior of the game's components
    this.Space.LogicUpdate(dt);
    // Applies velocities, checks collisions
    this.PhysicsSystem.PhysicsUpdate(dt);
    // Useful for anything that should happen after physics
    this.Space.LateUpdate(dt);
    // Prune destroyed objects
    this.Space.CleanUp();
    // Draw all the graphicals
    this.GraphicsSystem.Render();
    
    if (this.Space.UseDebugDraw)
      this.Space.DebugDraw();
  }
}


// Manages the creation, updating, and destruction
//   of Cogs. Can load scenes.
class Space
{
  constructor()
  {
    // The array of all the objects in the space
    this.List = [];
    this.UseDebugDraw = true;
  }
  
  // Creates and returns a new Cog
  Create(name = "Cog")
  {
    let cog = new Cog();
    cog.Name = name;
    this.List.push(cog);
    
    return cog;
  }
  
  // Destroys all the Cogs in the space
  Clear()
  {
    for (const cog of this.List)
      cog.Destroy();
  }
  
  // Loads a scene destructively (that is, not additively)
  Load(scene)
  {
    // Clears everything first and then adds the new objects
    this.Clear();
    this.LoadAdditively(scene);
  }
  
  // Loads a scene, adding its Cogs to the ones already there
  LoadAdditively(scene)
  {
    scene.Load(this);
  }
  
  // Finds the Cog that has the given Id (if any)
  Get(id)
  {
    for (const cog of this.List)
      if (cog.Id === id)
        return cog;
    
    return null;
  }
  
  // Finds the first Cog with the given name (if any)
  Find(name)
  {
    for (const cog of this.List)
      if (cog.Name === name)
        return cog;
    
    return null;
  }
  
  // Returns an array of all the Cogs with the given name
  FindAll(name)
  {
    let cogs = [];
    
    for (const cog of this.List)
      if (cog.Name === name)
        cogs.push(cog);
    
    return cogs;
  }
  
  // Updates all the Cogs' components' behaviors
  LogicUpdate(dt)
  {
    for (const cog of this.List)
      cog.LogicUpdate(dt);
  }
  
  // Useful for anything that should happen after physics
  LateUpdate(dt)
  {
    for (const cog of this.List)
      cog.LateUpdate(dt);
  }
  
  DebugDraw()
  {
    for (const cog of this.List)
      cog.DebugDraw();
  }
  
  // Prunes all the marked Cogs out of the Space
  CleanUp()
  {
    let notDestroyedList = [];
    
    for (const cog of this.List)
    {
      // Make sure you call the CleanUp function
      //   before you lose your reference!
      if (cog.Marked)
        cog.CleanUp();
      else
        notDestroyedList.push(cog);
    }
    
    this.List = notDestroyedList;
  }
}


// Updates all the Bodies to apply their velocities
//   to their positions and also update their velocities
//   based on gravity (maybe forces later?).
// Also manages collisions.
class PhysicsSystem
{
  constructor()
  {
    // Static Colliders don't check collision against each other
    this.StaticList = [];
    // Dynamic Colliders can move and check against
    //   statics and dynamics
    this.DynamicList = [];
    // The array of all the Body components present
    this.BodyList = [];
    // The TileMap, if any, that should be considered by
    //   TileMapCollider Components to be solid
    this.SolidTileMap = null;
  }
  
  // Adds the given Collider to whichever list it belongs in
  AddCollider(collider)
  {
    (collider.Dynamic ? this.DynamicList : this.StaticList).push(collider);
  }
  
  // Finds the given Collider and removes it from its list
  RemoveCollider(collider)
  {
    let list = collider.Dynamic ? this.DynamicList : this.StaticList;
    
    let length = list.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (list[i].Id === collider.id)
      {
        list[i] = list[length - 1];
        --list.length;
        
        return;
      }
    }
  }
  
  // Adds the given Body to the array
  AddBody(body)
  {
    this.BodyList.push(body);
  }
  
  // Finds the given Body and removes it
  RemoveBody(body)
  {
    let length = this.BodyList.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (this.BodyList[i].Id === graphical.id)
      {
        this.BodyList[i] = this.BodyList[length - 1];
        --this.BodyList.length;
        
        return;
      }
    }
  }
  
  AddSolidTileMap(tileMap)
  {
    this.SolidTileMap = tileMap;
  }
  
  RemoveSolidTileMap(tileMap)
  {
    if (this.SolidTileMap.Id === tileMap.Id)
      this.SolidTileMap = null;
  }
  
  // Applies velocities, etc., then checks for collisions
  PhysicsUpdate(dt)
  {
    for (const body of this.BodyList)
      body.PhysicsUpdate(dt);
    
    this.CheckCollisions();
  }
  
  // Detects collisions (later will resolve as well),
  //   and calls collision functions on involved Cogs
  CheckCollisions()
  {
    for (let i = 0; i < this.DynamicList.length; ++i)
    {
      let a = this.DynamicList[i];
      
      for (const b of this.StaticList)
        this.Test(a, b);
      
      for (let j = i + 1; j < this.DynamicList.length; ++j)
        this.Test(a, this.DynamicList[j]);
    }
  }
  
  // Tests whether Collider a is touching Collider b,
  //   then calls the appropriate collision function
  Test(a, b)
  {
    // Currently we only have Aabb colliders
    
    // If they're both Aabbs, then...
    if (a.ComponentType === "AabbCollider")
    {
      if (b.ComponentType === "AabbCollider")
      {
        // If the AabbVsAabb check comes back true, then...
        if (this.AabbVsAabb(a, b))
        {
          // If these two are already touching,
          //   call PersistCollision
          // Otherwise call StartCollision
          if (a.ContactExistsWith(b))
            this.PersistCollision(a, b);
          else
            this.StartCollision(a, b);
        }
        else // Otherwise, if the AabbVsAabb check is false, then...
        {
          // First prune a from b
          b.PruneContactWith(a);
          
          // Then prune b from a, and,
          //   if they were previously in contact, call EndCollision
          if (a.PruneContactWith(b))
            this.EndCollision(a, b);
        }
      }
    }
  }
  
  // Returns true if the two AabbColliders are touching, false otherwise
  AabbVsAabb(a, b, aVel = null, bVel = null)
  {
    let contact = new Contact();
    
    let aL = a.Left;
    let aR = a.Right;
    let aT = a.Top;
    let aB = a.Bottom;
    let bL = b.Left;
    let bR = b.Right;
    let bT = b.Top;
    let bB = b.Bottom;
    
    if (aL > bR)
      return false;
    if (aR < bL)
      return false;
    if (aT > bB)
      return false;
    if (aB < bT)
      return false;
    
    return true;
  }
  
  // Adds a new contact to the two Colliders
  //   and calls their CollisionStarted functions
  StartCollision(a, b)
  {
    let collision = new Collision();
    collision.Other = b;
    a.Owner.CollisionStarted(collision);
    collision.Other = a;
    b.Owner.CollisionStarted(collision);
    let contactA = new Contact();
    let contactB = new Contact();
    contactA.OtherCollider = b;
    contactB.OtherCollider = a;
    a.AddContact(contactA);
    b.AddContact(contactB);
  }
  
  // No new contact needed, so just calls CollisionPersisted
  PersistCollision(a, b)
  {
    let collision = new Collision();
    collision.Other = b;
    a.Owner.CollisionPersisted(collision);
    collision.Other = a;
    b.Owner.CollisionPersisted(collision);
  }
  
  // Calls CollisionEnded on the two Colliders
  EndCollision(a, b)
  {
    let collision = new Collision();
    collision.Other = b;
    a.Owner.CollisionEnded(collision);
    collision.Other = a;
    b.Owner.CollisionEnded(collision);
  }
}


// Manages the drawing and ordering of all the Graphicals
class GraphicsSystem
{
  constructor()
  {
    // The map of all the Graphical components present
    this.Graphicals = new Map();
  }
  
  // Adds the given Graphical to the system
  Add(graphical)
  {
    let layerIndex = graphical.Layer;
    let layerArray = this.Graphicals.get(layerIndex);
    
    if (layerArray == undefined)
      this.Graphicals.set(layerIndex, [graphical]);
    else
      layerArray.push(graphical);
  }
  
  // Finds the given Graphical and removes it
  Remove(graphical)
  {
    let layer = graphical.Layer;
    let layerArray = this.Graphicals.get(layer);
    let length = layerArray.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (layerArray[i].Id === graphical.id)
      {
        layerArray[i] = layerArray[length - 1];
        --layerArray.length;
        
        return;
      }
    }
  }
  
  // Asks each Graphical to render itself
  Render()
  {
    let allGraphicals = Array.from(this.Graphicals);
    allGraphicals.sort((a, b) => { return a[0] - b[0]; });
    
    for (let i = 0; i < allGraphicals.length; ++i)
    {
      let layerArray = allGraphicals[i][1];
      
      for (let j = 0; j < layerArray.length; ++j)
      {
        let graphical = layerArray[j];
        graphical.Render();
      }
    }
  }
}


// Data about a collision that began, persisted, or ended
class Collision
{
  constructor()
  {
    // The other Cog involved in a collision
    this.Other = null;
    
    // TODO:
    //   add world point, maybe also local point, penetration depth, etc
  }
}


class GraphicsLayer
{
  constructor()
  {
    this.LayerIndex = 0;
    this.Graphicals = [];
    this.SortFunction = null;
  }
  
  Add(graphical)
  {
    this.Graphicals.push(graphical);
    
    if (this.SortFunction != null)
      this.Graphicals.sort(this.SortFunction);
  }
  
  Remove(graphical)
  {
    if (this.SortFunction == null)
    {
      let length = this.Graphicals.length;

      for (let i = 0; i < length; ++i)
      {
        if (this.Graphicals[i] === graphical)
        {
          this.Graphicals[i] = this.Graphicals[length - 1];
          --this.Graphicals.length;
        }
      }
    }
    else
    {
      let i = this.Graphicals.indexOf(graphical);
      this.Graphicals.splice(i, 1);
    }
  }
  
  Render()
  {
    for (const graphical in this.Graphicals)
      graphical.Render();
  }
}

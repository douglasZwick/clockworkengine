import P5 from "p5"
import Cog from "./Cog";
import Collider from "./Collider"
import AabbCollider from "./AabbCollider";
import CircleCollider from "./CircleCollider";
import Engine from "./Engine";
import HotspotCollider from "./HotspotCollider";
import TileMapCollider from "./TileMapCollider";
import Body from "./Body"
import { G } from "./main";


// Updates all the Bodies to apply their velocities
//   to their positions and also update their velocities
//   based on gravity (maybe forces later?).
// Also manages collisions.
export default class PhysicsSystem
{
  Engine: Engine;
  // Static Colliders don't check collision against each other
  StaticList: Collider[] = [];
  // Dynamic Colliders can move and check against
  //   statics and dynamics
  DynamicList: Collider[] = [];
  // The array of all the Body components present
  BodyList: Body[] = [];
  // The array of any TileMaps that should do collision checking
  TileMapColliderList: TileMapCollider[] = [];
  // The array of any HotspotColliders that are present
  HotspotColliderList: HotspotCollider[] = [];

  _Gravity: P5.Vector = G.createVector(0, -9.81);
  
  // TODO:
  //   Ask Josh (any Josh) how to use a class as a key (not just its name)
  //   so that I can make my map of test functions as a
  //     Map<class, Map<class, function>>
  // TestFunctions: Map<any, Map<any, Function>>;

  constructor(engine: Engine)
  {
    this.Engine = engine;

    // let aabbMap = new Map<any, Function>();
    // aabbMap.set(AabbCollider, this.AabbVsAabb);
    // aabbMap.set(CircleCollider, this.AabbVsCircle);
    // let circleMap = new Map<any, Function>();
    // circleMap.set(AabbCollider, this.CircleVsAabb);
    // circleMap.set(CircleCollider, this.CircleVsCircle);
    // this.TestFunctions = new Map<any, Map<any, Function>>();
    // this.TestFunctions.set(AabbCollider, aabbMap);
    // this.TestFunctions.set(CircleCollider, circleMap);
  }

  // Access _Gravity by copy
  get Gravity() { return this._Gravity.copy(); }
  // Access _Gravity by copy
  set Gravity(gravity) { this._Gravity = gravity.copy(); }

  // Adds the given Collider to whichever list it belongs in
  AddCollider(collider: Collider)
  {
    (collider.Dynamic ? this.DynamicList : this.StaticList).push(collider);
  }
  
  // Finds the given Collider and removes it from its list
  RemoveCollider(collider: Collider)
  {
    let list = collider.Dynamic ? this.DynamicList : this.StaticList;
    
    let length = list.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (list[i].Id === collider.Id)
      {
        list[i] = list[length - 1];
        --list.length;
        
        return;
      }
    }
  }
  
  // Adds the given Body to the array
  AddBody(body: Body)
  {
    this.BodyList.push(body);
  }
  
  // Finds the given Body and removes it
  RemoveBody(body: Body)
  {
    let length = this.BodyList.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (this.BodyList[i].Id === body.Id)
      {
        this.BodyList[i] = this.BodyList[length - 1];
        --this.BodyList.length;
        
        return;
      }
    }
  }

  AddTileMapCollider(tileMapCollider: TileMapCollider)
  {
    this.TileMapColliderList.push(tileMapCollider);
  }

  RemoveTileMapCollider(tileMapCollider: TileMapCollider)
  {
    let length = this.TileMapColliderList.length;

    for (let i = 0; i < length; ++i)
    {
      if (this.TileMapColliderList[i].Id === tileMapCollider.Id)
      {
        this.TileMapColliderList[i] = this.TileMapColliderList[length - 1];
        --this.TileMapColliderList.length;

        return;
      }
    }
  }

  AddHotspotCollider(hotspotCollider: HotspotCollider)
  {
    this.HotspotColliderList.push(hotspotCollider);
  }

  RemoveHotspotCollider(hotspotCollider: HotspotCollider)
  {
    // TODO:
    //   Duhhh write a function that removes from an array ya dingus!!!!
    let length = this.HotspotColliderList.length;

    for (let i = 0; i < length; ++i)
    {
      if (this.HotspotColliderList[i].Id === hotspotCollider.Id)
      {
        this.HotspotColliderList[i] = this.HotspotColliderList[length - 1];
        --this.HotspotColliderList.length;

        return;
      }
    }
  }
  
  // Applies velocities, etc., then checks for collisions
  PhysicsUpdate(dt: number)
  {
    for (const body of this.BodyList)
      body.PhysicsUpdate(dt);
    
    this.CheckCollisions();
    this.CheckTileMaps();
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
  Test(a: Collider, b: Collider)
  {
    let testFunction = this.GetTestFunction(a, b);

    // If the check comes back true, then...
    if (testFunction(a, b, this))
    {
      // If these two are already touching,
      //   call PersistCollision
      // Otherwise call StartCollision
      if (a.ContactExistsWith(b))
        this.PersistCollision(a, b);
      else
        this.StartCollision(a, b);
    }
    else // Otherwise, if the check is false, then...
    {
      // First prune a from b
      b.PruneContactWith(a);
      
      // Then prune b from a, and,
      //   if they were previously in contact, call EndCollision
      if (a.PruneContactWith(b))
        this.EndCollision(a, b);
    }
  }

  GetTestFunction(a: Collider, b: Collider): Function
  {
    if (a instanceof AabbCollider)
    {
      if (b instanceof AabbCollider)
        return this.AabbVsAabb;
      else if (b instanceof CircleCollider)
        return this.AabbVsCircle;
    }
    else if (a instanceof CircleCollider)
    {
      if (b instanceof AabbCollider)
        return this.CircleVsAabb;
      else if (b instanceof CircleCollider)
        return this.CircleVsCircle;
    }

    console.error("No test function found for the given colliders: ", a, b);
    return null;

    // let aMap = this.TestFunctions.get(typeof a);
    // if (aMap == undefined)
    // {
    //   console.error("1: No test function found for the given colliders: ", a, b);
    //   return null;
    // }
    // let testFunction = aMap.get(typeof b);
    // if (testFunction == undefined)
    // {
    //   console.error("2: No test function found for the given colliders: ", a, b);
    //   return null;
    // }

    // return testFunction;
  }
  
  // Returns true if the two AabbColliders are touching, false otherwise
  AabbVsAabb(a: AabbCollider, b: AabbCollider, self: PhysicsSystem): boolean
  {
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
    if (aB > bT)
      return false;
    if (aT < bB)
      return false;
    
    return true;
  }

  AabbVsCircle(a: AabbCollider, b: CircleCollider, self: PhysicsSystem): boolean
  {
    let center = b.Tx.Position;

    if (self.PointVsAabbCollider(center, a))
      return true;

    let projectionPoint = center.copy();
    
    if (center.x > a.Right)
      projectionPoint.x = a.Right;
    else if (center.x < a.Left)
      projectionPoint.x = a.Left;
    
    if (center.y > a.Top)
      projectionPoint.y = a.Top;
    else if (center.y < a.Bottom)
      projectionPoint.y = a.Bottom;

    return self.PointVsCircleCollider(projectionPoint, b);
  }

  CircleVsAabb(a: CircleCollider, b: AabbCollider, self: PhysicsSystem): boolean
  {
    return self.AabbVsCircle(b, a, self);
  }

  CircleVsCircle(a: CircleCollider, b: CircleCollider, self: PhysicsSystem): boolean
  {
    return G.dist(a.Tx.X, a.Tx.Y, b.Tx.X, b.Tx.Y) <= a.Radius + b.Radius;
  }

  PointVsAabbCollider(point: P5.Vector, collider: AabbCollider): boolean
  {
    if (point.x > collider.Right) return false;
    if (point.x < collider.Left) return false;
    if (point.y > collider.Top) return false;
    if (point.y < collider.Bottom) return false;

    return true;
  }

  PointVsCircleCollider(point: P5.Vector, collider: CircleCollider): boolean
  {
    let dX = collider.Tx.X - point.x;
    let dY = collider.Tx.Y - point.y;
    let distSq = dX * dX + dY * dY;
    let radiusSq = collider.Radius * collider.Radius;

    return distSq <= radiusSq;
  }
  
  // Adds a new contact to the two Colliders
  //   and calls their CollisionStarted functions
  StartCollision(a: Collider, b: Collider)
  {
    let collision = new Collision();
    collision.Other = b.Owner;
    a.Owner.CollisionStarted(collision);
    collision.Other = a.Owner;
    b.Owner.CollisionStarted(collision);
    let contactA = new Contact();
    let contactB = new Contact();
    contactA.OtherCollider = b;
    contactB.OtherCollider = a;
    a.AddContact(contactA);
    b.AddContact(contactB);
  }
  
  // No new contact needed, so just calls CollisionPersisted
  PersistCollision(a: Collider, b: Collider)
  {
    let collision = new Collision();
    collision.Other = b.Owner;
    a.Owner.CollisionPersisted(collision);
    collision.Other = a.Owner;
    b.Owner.CollisionPersisted(collision);
  }
  
  // Calls CollisionEnded on the two Colliders
  EndCollision(a: Collider, b: Collider)
  {
    let collision = new Collision();
    collision.Other = b.Owner;
    a.Owner.CollisionEnded(collision);
    collision.Other = a.Owner;
    b.Owner.CollisionEnded(collision);
  }

  CheckTileMaps()
  {
    for (const tileMapCollider of this.TileMapColliderList)
      for (const hotspotCollider of this.HotspotColliderList)
        hotspotCollider.CheckHotspots(tileMapCollider.TileMap);
  }
}


// Data about a collision that began, persisted, or ended
export class Collision
{
  // TODO:
  //   add world point, maybe also local point, penetration depth, etc

  // The other Cog involved in a collision
  Other: Cog = null;
}


// Contact info about the overlap of two colliding objects
export class Contact
{
  OtherCollider: Collider = null;
  Position: P5.Vector = null;
  ResolutionVector: P5.Vector = null;
}

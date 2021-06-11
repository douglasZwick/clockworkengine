import P5 from "p5"
import { Cog, Collider, AabbCollider } from "./Cog";
import Engine from "./Engine";
import HotspotCollider from "./HotspotCollider";
import { TileMap } from "./TileMap";
import TileMapCollider from "./TileMapCollider";
import { Body } from "./Cog"


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
  // The TileMap, if any, that should be considered by
  //   TileMapCollider Components to be solid
  SolidTileMap: TileMap = null;

  constructor(engine: Engine)
  {
    this.Engine = engine;
  }
  
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
  
  AddSolidTileMap(tileMap: TileMap)
  {
    this.SolidTileMap = tileMap;
  }
  
  RemoveSolidTileMap(tileMap: TileMap)
  {
    if (this.SolidTileMap.Id === tileMap.Id)
      this.SolidTileMap = null;
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
    // Currently we only have Aabb colliders
    
    // If they're both Aabbs, then...
    if (a instanceof AabbCollider)
    {
      if (b instanceof AabbCollider)
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
  AabbVsAabb(a: AabbCollider, b: AabbCollider, aVel: P5.Vector = null, bVel: P5.Vector = null): boolean
  {
    // let contact = new Contact();
    
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

// CLOCKWORK ENGINE
//   v. something
// 
// by Doug Zwick
// 
// Heavily inspired by the Zero Engine
//   https://github.com/zeroengineteam/ZeroCore


import Space from "./Space"
import InputMaster, { ImMode, Key } from "./InputMaster"
import { G } from "./main"
import PhysicsSystem from "./PhysicsSystem"
import { GraphicsSystem } from "./GraphicsSystem"
import Resources from "./Resources"


export var IM: InputMaster;


enum DtMode
{
  Actual,
  Fixed,
}


export default class Engine
{
  static Instance: Engine;
  // The IdCounter is used by CountedObjects to get unique ID numbers
  static IdCounter: number = 0;
  // Defines the number of world units per logical "meter"
  static Meter: number = 32;

  Space: Space;
  PhysicsSystem: PhysicsSystem;
  GraphicsSystem: GraphicsSystem;
  InputMaster: InputMaster;
  DtMode: DtMode = DtMode.Actual;
  FixedTimeStep: number = 1/60;
  _FrameCount: number = 0;
  _ElapsedTime: number = 0;

  constructor()
  {
    Engine.Instance = this;

    this.Space = new Space(this);
    this.PhysicsSystem = new PhysicsSystem(this);
    this.GraphicsSystem = new GraphicsSystem(this);
    this.InputMaster = new InputMaster(this);
    IM = this.InputMaster;
  }
  
  static get FrameCount() { return Engine.Instance._FrameCount; }
  static get FrameCountStr() { return ("        " + this.FrameCount).slice(-8); }
  static get ElapsedTime() { return Engine.Instance._ElapsedTime; }
  // Gets the next unique ID number
  static NextId(): number { return Engine.IdCounter++; }
  static Dt(): number
  {
    return Engine.Instance.DtMode === DtMode.Fixed ?
      Engine.Instance.FixedTimeStep : G.deltaTime / 1000;
  }

  async LoadResources()
  {
    await Resources.Load();
  }
  
  Update()
  {
    let dt = Engine.Dt();

    if (IM.Mode === ImMode.Replay)
      IM.CopyFromHistory();

    if (IM.Down(Key.Control) && IM.Pressed(Key.D))
      this.Space.ToggleDebugDraw();
    
    if (IM.Down(Key.Control) && IM.Pressed(Key.R))
      this.Space.Reload();
    
    if (IM.Down(Key.Control) && IM.Down(Key.Shift) && IM.Pressed(Key.B))
      this.Break();

    // Update the behavior of the game's components
    this.Space.LogicUpdate(dt);
    // Applies velocities, checks collisions
    this.PhysicsSystem.PhysicsUpdate(dt);
    // Useful for anything that should happen after physics
    this.Space.LateUpdate(dt);
    // Prune destroyed objects
    this.Space.CleanUp();
    // Draw all the graphicals
    this.GraphicsSystem.Render(dt);
    
    if (this.Space.UseDebugDraw)
      this.Space.DebugDraw();

    // Update the key arrays in the InputMaster
    IM.Update();

    ++this._FrameCount;
    this._ElapsedTime += dt;
  }

  Break()
  {
    G.noLoop();
  }
}

import P5 from "p5"
import Cog from "./Cog";
import { DebugRect, DebugLine, DebugPoint, DebugCircle } from "./DebugDraw";
import Engine, { IM } from "./Engine";
import { Key } from "./InputMaster";
import { G } from "./main";
import { Scene } from "./Scene";


// Manages the creation, updating, and destruction
//   of Cogs. Can load scenes.
export default class Space
{
  // The engine containing this space
  Engine: Engine;
  // The array of all the objects in the space
  List: Cog[] = [];
  // The last scene loaded
  CurrentScene: Scene = null;
  // Whether debug drawing should be performed
  UseDebugDraw: boolean = false;
  
  constructor(engine: Engine)
  {
    this.Engine = engine;
  }

  // The GraphicsSystem of this Space
  get GraphicsSystem() { return this.Engine.GraphicsSystem; }
  // The PhysicsSystem of this Space
  get PhysicsSystem() { return this.Engine.PhysicsSystem; }
  
  // Creates and returns a new Cog
  Create(name: string = "Cog"): Cog
  {
    let cog = new Cog(this);
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
  Load(scene: Scene)
  {
    // Clears everything first and then adds the new objects
    this.Clear();
    this.CleanUp();
    this.LoadAdditively(scene);

    this.CurrentScene = scene;
  }
  
  // Loads a scene, adding its Cogs to the ones already there
  LoadAdditively(scene: Scene)
  {
    scene.Load(this);
    
    if (this.CurrentScene == null)
      this.CurrentScene = scene;
  }

  Reload()
  {
    if (this.CurrentScene != null)
      this.Load(this.CurrentScene);
  }
  
  // Finds the Cog that has the given Id (if any)
  Get(id: number): Cog
  {
    for (const cog of this.List)
      if (cog.Id === id)
        return cog;
    
    return null;
  }
  
  // Finds the first Cog with the given name (if any)
  Find(name: string): Cog
  {
    for (const cog of this.List)
      if (cog.Name === name)
        return cog;
    
    return null;
  }
  
  // Returns an array of all the Cogs with the given name
  FindAll(name: string): Cog[]
  {
    let cogs = Array<Cog>();
    
    for (const cog of this.List)
      if (cog.Name === name)
        cogs.push(cog);
    
    return cogs;
  }

  ToggleDebugDraw()
  {
    this.UseDebugDraw = !this.UseDebugDraw;
  }
  
  // Updates all the Cogs' components' behaviors
  LogicUpdate(dt: number)
  {
    if (IM.Pressed(Key.M))
      G.print(this.List);

    for (const cog of this.List)
      cog.LogicUpdate(dt);
  }
  
  // Useful for anything that should happen after physics
  LateUpdate(dt: number)
  {
    for (const cog of this.List)
      cog.LateUpdate(dt);
  }
  
  // Draws participating components for debugging purposes
  DebugDraw()
  {
    for (const cog of this.List)
      cog.DebugDraw();
  }
  
  // Prunes all the marked Cogs out of the Space
  CleanUp()
  {
    let notDestroyedList = Array<Cog>();
    
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

  DebugRect(position: P5.Vector, w: number, h: number,
    fill: P5.Color = G.color(255, 100), stroke: P5.Color = G.color(255),
    useStroke: boolean = true, useFill: boolean = true, strokeWeight: number = 1)
  {
    if (!this.UseDebugDraw)
      return;

    let rect = new DebugRect(position, w, h,
      fill, stroke, useStroke, useFill, strokeWeight);
    this.GraphicsSystem.AddDebugShape(rect);
  }

  DebugLine(start: P5.Vector, end: P5.Vector,
    color: P5.Color = G.color(255), thickness: number = 1)
  {
    if (!this.UseDebugDraw)
      return;

    let line = new DebugLine(start, end, color, thickness);
    this.GraphicsSystem.AddDebugShape(line);
  }

  DebugPoint(position: P5.Vector, color: P5.Color = G.color(255), radius: number = 1)
  {
    if (!this.UseDebugDraw)
      return;

    let point = new DebugPoint(position, color, radius);
    this.GraphicsSystem.AddDebugShape(point);
  }

  DebugCircle(position: P5.Vector, r: number,
    fill: P5.Color = G.color(255, 100), stroke: P5.Color = G.color(255),
    useStroke: boolean = true, useFill: boolean = true,
    strokeWeight: number = 1)
  {
    if (!this.UseDebugDraw)
      return;
    
    let circle = new DebugCircle(position, r, fill, stroke,
      useStroke, useFill, strokeWeight);
    this.GraphicsSystem.AddDebugShape(circle);
  }
}

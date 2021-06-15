import P5 from "p5"
import Graphical from "./Graphical";
import { DebugShape } from "./DebugDraw";
import Engine from "./Engine";
import { G } from "./main"


// Manages the drawing and ordering of all the Graphicals
export class GraphicsSystem
{
  Engine: Engine;

  // The map of all the Graphical components present
  Graphicals: Map<number, Graphical[]> = new Map<number, Graphical[]>();

  DebugShapes: DebugShape[] = [];

  constructor(engine: Engine)
  {
    this.Engine = engine;
  }
  
  // Adds the given Graphical to the system
  Add(graphical: Graphical)
  {
    let layerIndex = graphical.Layer;
    let layerArray = this.Graphicals.get(layerIndex);
    
    if (layerArray == undefined)
      this.Graphicals.set(layerIndex, [graphical]);
    else
      layerArray.push(graphical);
  }
  
  // Finds the given Graphical and removes it
  Remove(graphical: Graphical)
  {
    let layer = graphical.Layer;
    let layerArray = this.Graphicals.get(layer);
    let length = layerArray.length;
    
    for (let i = 0; i < length; ++i)
    {
      if (layerArray[i].Id === graphical.Id)
      {
        layerArray[i] = layerArray[length - 1];
        --layerArray.length;
        
        return;
      }
    }
  }

  AddDebugShape(shape: DebugShape)
  {
    this.DebugShapes.push(shape);
  }
  
  // Asks each Graphical to render itself
  Render()
  {
    G.push();
    // So that positive Y is up and positive rotations are counter-clockwise
    G.scale(1, -1, 1);
    G.translate(-320, -180, 0);

    let allGraphicals = Array.from(this.Graphicals);
    allGraphicals.sort((a, b) => { return a[0] - b[0]; });
    
    for (let i = 0; i < allGraphicals.length; ++i)
    {
      let layerArray = allGraphicals[i][1];
      
      for (const graphical of layerArray)
      {
        if (!graphical.Active) continue;

        G.push();
        let tx = graphical.Tx;
        let translation = P5.Vector.add(tx._Position, graphical._Offset).mult(Engine.Meter);
        let rotation = tx.Rotation;
        let scale = tx._Scale;
        G.translate(translation);
        G.rotate(rotation);
        G.scale(scale);
        graphical.Render();
        G.pop();
      }
    }

    for (const debugShape of this.DebugShapes)
      debugShape.Render();

    this.DebugShapes = [];

    G.pop();
  }
}


// TODO:
//   Maybe use this...?
class GraphicsLayer
{
  LayerIndex: number = 0;
  Graphicals: Graphical[] = [];
  SortFunction: (a: Graphical, b: Graphical) => number = null;
  
  Add(graphical: Graphical)
  {
    this.Graphicals.push(graphical);
    
    if (this.SortFunction != null)
      this.Graphicals.sort(this.SortFunction);
  }
  
  Remove(graphical: Graphical)
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
    for (const graphical of this.Graphicals)
      graphical.Render();
  }
}

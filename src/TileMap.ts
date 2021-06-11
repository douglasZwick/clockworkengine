import P5 from "p5"
import { G } from "./main"
import { Graphical } from "./Cog"
import Engine from "./Engine";


// Contains all relevant data to identify and use
//   the tiles found in a TileMap
export class Tile
{
  X: number;
  Y: number;
  Solid: boolean;
  Color: P5.Color;

  constructor(x: number, y: number, solid = false, tileColor = G.color(255))
  {
    this.X = x;
    this.Y = y;
    this.Solid = solid;
    this.Color = tileColor;
  }
}


// A 2D Map of Tile, describing a scene's tiled information
// TODO:
//   decide if this actually should be a Graphical
export class TileMap extends Graphical
{
  // The 2D container of the map itself
  Map: Map<number, Map<number, Tile>> = new Map<number, Map<number, Tile>>();
  // Whether this TileMap should be considered by
  //   TileMapCollider Components to be solid
  Solid: boolean = false;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Initialize()
  {
    super.Initialize();

    if (this.Solid)
      this.Space.PhysicsSystem.AddSolidTileMap(this);
  }

  // Adds the given tile at the given X and Y coordinates
  Add(tile: Tile, x: number, y: number)
  {
    // Just in case we're doing something with automation
    if (tile == undefined)
      return;

    let copy = new Tile(x, y, tile.Solid, tile.Color);

    // Get the column at the indicated X value
    let column = this.Map.get(x);

    // If nothing was there...
    if (column == undefined)
    {
      // Make a new map
      column = new Map<number, Tile>();
      // The new map is a column, so add
      //   the tile at the specified Y value
      column.set(y, copy);
      // Add the new column to the map at the specified X value
      this.Map.set(x, column);
    }
    else // Otherwise, if there was something there...
    {
      // This map is a column, so add
      //   the tile at the specified Y value
      column.set(y, copy);
    }
  }

  // Reads in a 2D array of integers, using an accompanying
  //   1D array to know what to pass into the Add function
  ReadArray(indexArray: number[][], legend: Tile[])
  {
    for (let y = 0; y < indexArray.length; ++y)
    {
      let row = indexArray[y];

      for (let x = 0; x < row.length; ++x)
      {
        let index = row[x];
        let tile = legend[index];
        this.Add(tile, x, y);
      }
    }
  }

  // Gets the tile at the given X and Y integer coordinates
  Get(x: number, y: number): Tile
  {
    // Get the column at the indicated X value
    let column = this.Map.get(x);

    // If nothing was there...
    if (column == undefined)
    {
      // Return undefined, which the Render function will
      //   know how to handle
      return undefined;
    }
    else // Otherwise, if there was something there...
    {
      // This map is a column, so get
      //   the tile at the specified Y value (undefined if nothing)
      return column.get(y);
    }
  }

  GetTileFromWorldPosition(position: P5.Vector): Tile
  {
    // console.log("---------");
    let shiftedX = position.x - this._Offset.x - this.Tx.X + 0.5;
    let shiftedY = position.y - this._Offset.y - this.Tx.Y + 0.5;
    
    let indexX = Math.floor(shiftedX);
    let indexY = Math.floor(shiftedY);
    
    let tile = this.Get(indexX, indexY);
    
    let x = tile == undefined ? NaN : tile.X + this._Offset.x + this.Tx.X;
    let y = tile == undefined ? NaN : tile.Y + this._Offset.y + this.Tx.Y;
    
    if (this.Space.UseDebugDraw)
    {
      let solid = tile != undefined && tile.Solid;
      let fill = solid ? G.color(250, 240, 10, 100) : G.color(0, 255, 255, 100);
      let stroke = solid ? G.color(250, 240, 10) : G.color(0, 255, 255);

      this.Space.DebugRect(G.createVector(x, y), 1, 1,
        fill, stroke, true, true, 4);
    }
    
    return tile;
  }

  GetTileWorldPositionFromIndices(x: number, y: number): P5.Vector
  {
    return P5.Vector.add(this.Tx._Position, this._Offset).add(x, y);
  }

  GetTileWorldLeftFromIndex(x: number): number
  {
    return this.Tx.X + this._Offset.x + x - 0.5;
  }

  GetTileWorldRightFromIndex(x: number): number
  {
    return this.Tx.X + this._Offset.x + x + 0.5;
  }

  GetTileWorldTopFromIndex(y: number): number
  {
    return this.Tx.Y + this._Offset.y + y - 0.5;
  }
  
  GetTileWorldBottomFromIndex(y: number): number
  {
    return this.Tx.Y + this._Offset.y + y + 0.5;
  }

  Render()
  {
    if (!this.Active) return;  // Invisible if inactive

    for (const columnPair of this.Map)
    {
      let columnIndex = columnPair[0];
      let column = columnPair[1];

      for (const tilePair of column)
      {
        let rowIndex = tilePair[0];
        let tile = tilePair[1];

        if (tile != undefined)
        {
          G.push();

          G.fill(tile.Color);
          G.rectMode(G.CENTER);
          let x = (this.X + this._Offset.x + columnIndex) * Engine.Meter;
          let y = (this.Y + this._Offset.y + rowIndex) * Engine.Meter;
          G.rect(x, y, Engine.Meter, Engine.Meter);

          G.pop();
        }
      }
    }
  }

  CleanUp()
  {
    super.CleanUp();

    this.Map.clear();

    if (this.Solid)
      this.Space.PhysicsSystem.RemoveSolidTileMap(this);
  }
}

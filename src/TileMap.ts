import P5 from "p5"
import { G } from "./main"
import { Component, Graphical } from "./Cog"
import Engine from "./Engine";


// Contains all relevant data to identify and use
//   the tiles found in a TileMap
export class Tile
{
  Solid: boolean;
  Color: P5.Color;

  constructor(solid = false, tileColor = G.color(255))
  {
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

    this.Name = "TileMap";
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

    // Get the column at the indicated X value
    let column = this.Map.get(x);

    // If nothing was there...
    if (column == undefined)
    {
      // Make a new map
      column = new Map<number, Tile>();
      // The new map is a column, so add
      //   the tile at the specified Y value
      column.set(y, tile);
      // Add the new column to the map at the specified X value
      this.Map.set(x, column);
    }
    else // Otherwise, if there was something there...
    {
      // This map is a column, so add
      //   the tile at the specified Y value
      column.set(y, tile);
    }
  }

  // Reads in a 2D array of integers, using an accompanying
  //   1D array to know what to pass into the Add function
  ReadArray(indexArray: number[][], legend: Tile[])
  {
    for (let y = 0; y < indexArray.length; ++y)
      for (let x = 0; x < indexArray[y].length; ++x)
        this.Add(legend[indexArray[y][x]], x, y);
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

  GetFromWorldPosition(position: P5.Vector): Tile
  {
    let shiftedX = position.x - this.Offset.x - this.Tx.X;
    let shiftedY = position.y - this.Offset.y - this.Tx.Y;

    return this.Get(Math.floor(shiftedX), Math.floor(shiftedY));
  }

  GetTilePositionFromWorldPosition(position: P5.Vector)
  {
    let shiftedX = position.x - this.Offset.x - this.Tx.X;
    let shiftedY = position.y - this.Offset.y - this.Tx.Y;
    let indexX = Math.floor(shiftedX);
    let indexY = Math.floor(shiftedY);
    let tileX = indexX + this.Offset.x + this.Tx.X;
    let tileY = indexY + this.Offset.y + this.Tx.Y;

    return G.createVector(tileX, tileY);
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
          let x = (this.X + this.Offset.x + columnIndex) * Engine.Meter;
          let y = (this.Y + this.Offset.y + rowIndex) * Engine.Meter;
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


export class TileMapCollider extends Component
{
  // How far from the corner each hotspot should be
  CornerThickness: number = 1 / 4;
  // Width of this object
  W: number = 1;
  // Height of this object
  H: number = 1;
  // The hotspots to use to check the tiles for solidity
  Hotspots: TileMapColliderHotspot[] = [];

  constructor()
  {
    super();

    this.Name = "TileMapCollider";
  }

  Initialize()
  {
    super.Initialize();

    this.Hotspots.length = 8;
    let tx = this.Tx;
    let w = this.W / 2;
    let h = this.H / 2;
    let x = w - this.CornerThickness;
    let y = h - this.CornerThickness;
    //  --2-------1--
    //  3     .     0
    //  |     .     |
    //  | . . + . . |
    //  |     .     |
    //  4     .     7
    //  --5-------6--
    this.Hotspots[0] = new TileMapColliderHotspot(G.createVector(w, -y));
    this.Hotspots[1] = new TileMapColliderHotspot(G.createVector(x, -h));
    this.Hotspots[2] = new TileMapColliderHotspot(G.createVector(-x, -h));
    this.Hotspots[3] = new TileMapColliderHotspot(G.createVector(-w, -y));
    this.Hotspots[4] = new TileMapColliderHotspot(G.createVector(-w, y));
    this.Hotspots[5] = new TileMapColliderHotspot(G.createVector(-x, h));
    this.Hotspots[6] = new TileMapColliderHotspot(G.createVector(x, h));
    this.Hotspots[7] = new TileMapColliderHotspot(G.createVector(w, y));
  }

  LateUpdate(dt: number)
  {
    this.CheckHotspots();
  }

  CheckHotspots()
  {
    let hotspot: TileMapColliderHotspot, tile: Tile;
    let position = this.Tx.Position;
    let solidTileMap = this.Space.PhysicsSystem.SolidTileMap;

    hotspot = this.Hotspots[0];
    tile = hotspot.Check(position, solidTileMap);
    let solid0 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[1];
    tile = hotspot.Check(position, solidTileMap);
    let solid1 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[2];
    tile = hotspot.Check(position, solidTileMap);
    let solid2 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[3];
    tile = hotspot.Check(position, solidTileMap);
    let solid3 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[4];
    tile = hotspot.Check(position, solidTileMap);
    let solid4 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[5];
    tile = hotspot.Check(position, solidTileMap);
    let solid5 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[6];
    tile = hotspot.Check(position, solidTileMap);
    let solid6 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[7];
    tile = hotspot.Check(position, solidTileMap);
    let solid7 = tile != undefined && tile.Solid;

    if (solid0 || solid7)
      this.SnapL(solidTileMap);
    if (solid1 || solid2)
      this.SnapD(solidTileMap);
    if (solid3 || solid4)
      this.SnapR(solidTileMap);
    if (solid5 || solid6)
      this.SnapU(solidTileMap);
  }

  SnapL(solidTileMap: TileMap)
  {
    // TODO:
    //   get the hotspot world position more elegantly
    let p0 = P5.Vector.add(this.Hotspots[0].Offset, this.Tx.Position);
    let tilePosition = solidTileMap.GetTilePositionFromWorldPosition(p0);
    let tileLeft = tilePosition.x - 0.5;
    let snapDistance = tileLeft - p0.x;
    this.Tx.AddX(snapDistance);
  }

  SnapR(solidTileMap: TileMap) {
    let p3 = P5.Vector.add(this.Hotspots[3].Offset, this.Tx.Position);
    let tilePosition = solidTileMap.GetTilePositionFromWorldPosition(p3);
    let tileRight = tilePosition.x + 0.5;
    let snapDistance = tileRight - p3.x;
    this.Tx.AddX(snapDistance);
  }

  SnapD(solidTileMap: TileMap) {
    let p1 = P5.Vector.add(this.Hotspots[1].Offset, this.Tx.Position);
    let tilePosition = solidTileMap.GetTilePositionFromWorldPosition(p1);
    let tileBottom = tilePosition.y + 0.5;
    let snapDistance = tileBottom - p1.y;
    this.Tx.AddY(snapDistance);
  }

  SnapU(solidTileMap: TileMap) {
    let p6 = P5.Vector.add(this.Hotspots[6].Offset, this.Tx.Position);
    let tilePosition = solidTileMap.GetTilePositionFromWorldPosition(p6);
    let tileTop = tilePosition.y - 0.5;
    let snapDistance = tileTop - p6.y;
    this.Tx.AddY(snapDistance);
  }

  DebugDraw()
  {
    G.push();

    G.strokeWeight(3);
    G.stroke(G.color(255));

    for (const hotspot of this.Hotspots)
    {
      let x = P5.Vector.add(this.Tx.Position, hotspot.Offset).x * Engine.Meter;
      let y = P5.Vector.add(this.Tx.Position, hotspot.Offset).y * Engine.Meter;
      G.point(x, y);
    }

    G.pop();
  }

  CleanUp()
  {
    this.Hotspots = [];
  }
}


class TileMapColliderHotspot
{
  Offset: P5.Vector;

  constructor(offset: P5.Vector)
  {
    this.Offset = offset;
  }

  Check(position: P5.Vector, tileMap: TileMap): Tile
  {
    if (tileMap == null)
      return undefined;

    let worldPos = P5.Vector.add(position, this.Offset);
    let x = Math.floor(worldPos.x);
    let y = Math.floor(worldPos.y);
    return tileMap.Get(x, y);
  }
}

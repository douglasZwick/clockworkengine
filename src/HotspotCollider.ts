import P5 from "p5"
import Tx from "./Tx";
import Component from "./Component";
import Engine from "./Engine";
import { G } from "./main";
import { Tile, TileMap } from "./TileMap";


export default class HotspotCollider extends Component
{
  // How far from the corner each hotspot should be
  CornerThickness: number = 1/4;
  // Width of this object
  W: number = 1;
  // Height of this object
  H: number = 1;

  Padding: number = 0;
  // The hotspots to use to check the tiles for solidity
  Hotspots: TileMapHotspot[] = [];

  HotspotsTriggered: boolean[] = [];

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  get WorldLeft() { return this.Tx.X - (this.W / 2 - this.Padding); }
  get WorldRight() { return this.Tx.X + (this.W / 2 - this.Padding); }
  get WorldBottom() { return this.Tx.Y - (this.H / 2 - this.Padding); }
  get WorldTop() { return this.Tx.Y + (this.H / 2 - this.Padding); }

  Initialize()
  {
    super.Initialize();

    this.Hotspots.length = 8;
    let w = this.W / 2 - this.Padding;
    let h = this.H / 2 - this.Padding;
    let x = w - this.CornerThickness;
    let y = h - this.CornerThickness;
    //  --3---------2--
    //  4      .      1
    //  |      .      |
    //  | . .  +  . . |
    //  |      .      |
    //  5      .      0
    //  --6---------7--
    this.Hotspots[0] = new TileMapHotspot(G.createVector( w, -y));
    this.Hotspots[1] = new TileMapHotspot(G.createVector( w,  y));
    this.Hotspots[2] = new TileMapHotspot(G.createVector( x,  h));
    this.Hotspots[3] = new TileMapHotspot(G.createVector(-x,  h));
    this.Hotspots[4] = new TileMapHotspot(G.createVector(-w,  y));
    this.Hotspots[5] = new TileMapHotspot(G.createVector(-w, -y));
    this.Hotspots[6] = new TileMapHotspot(G.createVector(-x, -h));
    this.Hotspots[7] = new TileMapHotspot(G.createVector( x, -h));

    this.HotspotsTriggered.length = this.Hotspots.length;
    this.HotspotsTriggered.fill(false);

    this.Space.PhysicsSystem.AddHotspotCollider(this);
  }

  CheckHotspots(tileMap: TileMap)
  {
    let hotspot: TileMapHotspot;
    let tileA: Tile, tileB: Tile, solidTile: Tile;
    
    // Check the right!
    hotspot = this.Hotspots[0];
    tileA = hotspot.Check(this.Tx, tileMap);
    hotspot = this.Hotspots[1];
    tileB = hotspot.Check(this.Tx, tileMap);

    this.HotspotsTriggered[0] = tileA != undefined && tileA.Solid;
    this.HotspotsTriggered[1] = tileB != undefined && tileB.Solid;

    if (this.HotspotsTriggered[0])
      solidTile = tileA;
    else if (this.HotspotsTriggered[1])
      solidTile = tileB;

    if (solidTile != undefined)
      this.SnapL(tileMap.GetTileWorldLeftFromIndex(solidTile.X));

    solidTile = undefined;

    // Check the top!
    hotspot = this.Hotspots[2];
    tileA = hotspot.Check(this.Tx, tileMap);
    hotspot = this.Hotspots[3];
    tileB = hotspot.Check(this.Tx, tileMap);

    this.HotspotsTriggered[2] = tileA != undefined && tileA.Solid;
    this.HotspotsTriggered[3] = tileB != undefined && tileB.Solid;

    if (this.HotspotsTriggered[2])
      solidTile = tileA;
    else if (this.HotspotsTriggered[3])
      solidTile = tileB;

    if (solidTile != undefined)
      this.SnapD(tileMap.GetTileWorldBottomFromIndex(solidTile.Y));

    solidTile = undefined;

    // Check the left!
    hotspot = this.Hotspots[4];
    tileA = hotspot.Check(this.Tx, tileMap);
    hotspot = this.Hotspots[5];
    tileB = hotspot.Check(this.Tx, tileMap);
    
    this.HotspotsTriggered[4] = tileA != undefined && tileA.Solid;
    this.HotspotsTriggered[5] = tileB != undefined && tileB.Solid;

    if (this.HotspotsTriggered[4])
      solidTile = tileA;
    else if (this.HotspotsTriggered[5])
      solidTile = tileB;

    if (solidTile != undefined)
      this.SnapR(tileMap.GetTileWorldRightFromIndex(solidTile.X));

    solidTile = undefined;

    // Check the bottom!
    hotspot = this.Hotspots[6];
    tileA = hotspot.Check(this.Tx, tileMap);
    hotspot = this.Hotspots[7];
    tileB = hotspot.Check(this.Tx, tileMap);

    this.HotspotsTriggered[6] = tileA != undefined && tileA.Solid;
    this.HotspotsTriggered[7] = tileB != undefined && tileB.Solid;

    if (this.HotspotsTriggered[6])
      solidTile = tileA;
    else if (this.HotspotsTriggered[7])
      solidTile = tileB;

    if (solidTile != undefined)
      this.SnapU(tileMap.GetTileWorldTopFromIndex(solidTile.Y));
  }

  SnapL(tileLeft: number)
  {
    let snapDistance = tileLeft - this.WorldRight;
    this.Tx.AddX(snapDistance);
  }

  SnapR(tileRight: number)
  {
    let snapDistance = tileRight - this.WorldLeft;
    this.Tx.AddX(snapDistance);
  }

  SnapD(tileBottom: number)
  {
    let snapDistance = tileBottom - this.WorldTop;
    this.Tx.AddY(snapDistance);
  }

  SnapU(tileTop: number)
  {
    let snapDistance = tileTop - this.WorldBottom;
    this.Tx.AddY(snapDistance);
  }

  DebugDraw()
  {
    G.push();

    G.strokeWeight(3);
    G.stroke(G.color(255));

    for (const hotspot of this.Hotspots)
    {
      let x = P5.Vector.add(this.Tx._Position, hotspot._Offset).x * Engine.Meter;
      let y = P5.Vector.add(this.Tx._Position, hotspot._Offset).y * Engine.Meter;
      G.point(x, y);
    }

    G.pop();
  }

  CleanUp()
  {
    this.Hotspots = [];
    this.Space.PhysicsSystem.RemoveHotspotCollider(this);
  }
}


class TileMapHotspot
{
  _Offset: P5.Vector;
  Color: P5.Color;

  constructor(offset: P5.Vector, color: P5.Color = G.color(255))
  {
    this.Offset = offset;
    this.Color = color;
  }

  get Offset() { return this._Offset.copy(); }
  set Offset(offset) { this._Offset = offset.copy(); }

  GetWorldPosition(tx: Tx): P5.Vector
  {
    return P5.Vector.add(tx._Position, this._Offset);
  }

  Check(tx: Tx, tileMap: TileMap): Tile
  {
    if (tileMap == null)
      return undefined;

    let worldPos = this.GetWorldPosition(tx);

    return tileMap.GetTileFromWorldPosition(worldPos);
  }
}

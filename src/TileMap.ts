// Contains all relevant data to identify and use
//   the tiles found in a TileMap
class Tile {
  constructor(solid = false, tileColor = color(255)) {
    this.Solid = solid;
    this.Color = tileColor;
  }
}


// A 2D Map of Tile, describing a scene's tiled information
// TODO:
//   decide if this actually should be a Graphical
class TileMap extends Graphical {
  constructor() {
    super();

    this.Name = "TileMap";
    // The 2D container of the map itself
    this.Map = new Map();
    // Whether this TileMap should be considered by
    //   TileMapCollider Components to be solid
    this.Solid = false;
  }

  Initialize() {
    super.Initialize();

    if (this.Solid)
      PHX.AddSolidTileMap(this);
  }

  // Adds the given tile at the given X and Y coordinates
  Add(tile, x, y) {
    // Just in case we're something with automation
    if (tile == undefined)
      return;

    // Get the column at the indicated X value
    let column = this.Map.get(x);

    // If nothing was there...
    if (column == undefined) {
      // Make a new map
      column = new Map();
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
  ReadArray(indexArray, legend) {
    for (let y = 0; y < indexArray.length; ++y)
      for (let x = 0; x < indexArray[y].length; ++x)
        this.Add(legend[indexArray[y][x]], x, y);
  }

  // Gets the tile at the given X and Y integer coordinates
  Get(x, y) {
    // Get the column at the indicated X value
    let column = this.Map.get(x);

    // If nothing was there...
    if (column == undefined) {
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

  GetFromWorldPosition(position) {
    let shiftedX = position.x - this.Offset.x - this.Tx.X;
    let shiftedY = position.y - this.Offset.y - this.Tx.Y;

    return this.Get(int(shiftedX), int(shiftedY));
  }

  GetTilePositionFromWorldPosition(position) {
    let shiftedX = position.x - this.Offset.x - this.Tx.X;
    let shiftedY = position.y - this.Offset.y - this.Tx.Y;
    let indexX = int(shiftedX);
    let indexY = int(shiftedY);
    let tileX = indexX + this.Offset.x + this.Tx.X;
    let tileY = indexY + this.Offset.y + this.Tx.Y;

    return createVector(tileX, tileY);
  }

  Render() {
    if (!this.Active) return;  // Invisible if inactive

    for (const columnPair of this.Map) {
      let columnIndex = columnPair[0];
      let column = columnPair[1];

      for (const tilePair of column) {
        let rowIndex = tilePair[0];
        let tile = tilePair[1];

        if (tile != undefined) {
          push();

          fill(tile.Color);
          rectMode(CENTER);
          let x = (this.X + this.Offset.x + columnIndex) * METER;
          let y = (this.Y + this.Offset.y + rowIndex) * METER;
          rect(x, y, METER, METER);

          pop();
        }
      }
    }
  }

  CleanUp() {
    super.CleanUp();

    if (this.Solid)
      PHX.RemoveSolidTileMap(this);
  }
}


class TileMapCollider extends Component {
  constructor() {
    super();

    this.Name = "TileMapCollider";
    // How far from the corner each hotspot should be
    this.CornerThickness = 1 / 8;
    // Width of this object
    this.W = 1;
    // Height of this object
    this.H = 1;
    // The hotspots to use to check the tiles for solidity
    this.Hotspots = [];
  }

  Initialize() {
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
    this.Hotspots[0] = new TileMapColliderHotspot(createVector(w, -y));
    this.Hotspots[1] = new TileMapColliderHotspot(createVector(x, -h));
    this.Hotspots[2] = new TileMapColliderHotspot(createVector(-x, -h));
    this.Hotspots[3] = new TileMapColliderHotspot(createVector(-w, -y));
    this.Hotspots[4] = new TileMapColliderHotspot(createVector(-w, y));
    this.Hotspots[5] = new TileMapColliderHotspot(createVector(-x, h));
    this.Hotspots[6] = new TileMapColliderHotspot(createVector(x, h));
    this.Hotspots[7] = new TileMapColliderHotspot(createVector(w, y));
  }

  LateUpdate(dt) {
    this.CheckHotspots();
  }

  CheckHotspots() {
    let hotspot, tile;
    let position = this.Tx.Position;

    hotspot = this.Hotspots[0];
    tile = hotspot.Check(position);
    let solid0 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[1];
    tile = hotspot.Check(position);
    let solid1 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[2];
    tile = hotspot.Check(position);
    let solid2 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[3];
    tile = hotspot.Check(position);
    let solid3 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[4];
    tile = hotspot.Check(position);
    let solid4 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[5];
    tile = hotspot.Check(position);
    let solid5 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[6];
    tile = hotspot.Check(position);
    let solid6 = tile != undefined && tile.Solid;
    hotspot = this.Hotspots[7];
    tile = hotspot.Check(position);
    let solid7 = tile != undefined && tile.Solid;

    if (solid0 || solid7)
      this.SnapL();
    if (solid1 || solid2)
      this.SnapD();
    if (solid3 || solid4)
      this.SnapR();
    if (solid5 || solid6)
      this.SnapU();
  }

  SnapL() {
    // TODO:
    //   get the hotspot world position more elegantly
    let p0 = p5.Vector.add(this.Hotspots[0].Offset, this.Tx.Position);
    let tilePosition = PHX.SolidTileMap.GetTilePositionFromWorldPosition(p0);
    let tileLeft = tilePosition.x - 0.5;
    let snapDistance = tileLeft - p0.x;
    this.Tx.AddX(snapDistance);
  }

  SnapR() {
    let p3 = p5.Vector.add(this.Hotspots[3].Offset, this.Tx.Position);
    let tilePosition = PHX.SolidTileMap.GetTilePositionFromWorldPosition(p3);
    let tileRight = tilePosition.x + 0.5;
    let snapDistance = tileRight - p3.x;
    this.Tx.AddX(snapDistance);
  }

  SnapD() {
    let p1 = p5.Vector.add(this.Hotspots[1].Offset, this.Tx.Position);
    let tilePosition = PHX.SolidTileMap.GetTilePositionFromWorldPosition(p1);
    let tileBottom = tilePosition.y + 0.5;
    let snapDistance = tileBottom - p1.y;
    this.Tx.AddY(snapDistance);
  }

  SnapU() {
    let p6 = p5.Vector.add(this.Hotspots[6].Offset, this.Tx.Position);
    let tilePosition = PHX.SolidTileMap.GetTilePositionFromWorldPosition(p6);
    let tileTop = tilePosition.y - 0.5;
    let snapDistance = tileTop - p6.y;
    this.Tx.AddY(snapDistance);
  }

  DebugDraw() {
    push();

    strokeWeight(3);
    stroke(color(255));
    for (let i = 0; i < this.Hotspots.length; ++i) {
      let x = p5.Vector.add(this.Tx.Position, this.Hotspots[i].Offset).x * METER;
      let y = p5.Vector.add(this.Tx.Position, this.Hotspots[i].Offset).y * METER;
      point(x, y);
    }

    pop();
  }

  CleanUp() {
    this.Hotspots = [];
  }
}


class TileMapColliderHotspot {
  constructor(offset) {
    this.Offset = offset;
  }

  Check(position) {
    let tileMap = PHX.SolidTileMap;

    if (tileMap == null)
      return undefined;

    let worldPos = p5.Vector.add(position, this.Offset);
    let x = int(worldPos.x);
    let y = int(worldPos.y);
    return tileMap.Get(x, y);
  }
}

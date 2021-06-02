class Scene {
  constructor() {
    this.Space = null;
  }

  Load(space) {
    this.Space = space;
  }
}


class TestScene extends Scene {
  Load(space) {
    super.Load(space);

    let appleBottom = "jeans";
    let boots = "fur";

    //     this.BlockCount = 0;

    //     let blocks =
    //     [
    //       [5, 9], [6, 9], [7, 9], [8, 8], [9, 8], [10, 8],
    //     ];
    //     this.PlaceBlocks(blocks);

    this.Hero(5, 6);
    this.CreateTileMap();
  }

  Hero(x, y) {
    let hero = this.Space.Create("Hero");

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    hero.Add(tx);

    let rect = new Rect();
    rect.Fill = color(200, 200, 50);
    rect.Layer = 1;
    hero.Add(rect);

    let basicMover = new BasicMover();
    let aabbCollider = new AabbCollider();
    let body = new Body();
    basicMover.Speed = 4;
    aabbCollider._Dynamic = true;
    body.Gravity = createVector(0, 0);
    body.Velocity = createVector(0, 0);
    let tileMapCollider = new TileMapCollider();

    hero.Add(basicMover);
    hero.Add(aabbCollider);
    hero.Add(body);
    hero.Add(tileMapCollider);

    hero.Initialize();
  }

  LayeredHero(x, y) {
    let hero = this.Space.Create("Hero");

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    hero.Add(tx);

    let layers = 7;
    let spacing = 1 / 3;
    for (let i = 0; i < layers; ++i) {
      let layer = new Rect();
      layer.Fill = color(0, 100 + i * 25, 0);
      layer.Offset = createVector(-i * spacing, -i * spacing);
      layer.Layer = 2 * i;
      hero.Add(layer);
    }

    let basicMover = new BasicMover();
    let aabbCollider = new AabbCollider();
    let body = new Body();
    basicMover.Speed = 4;
    aabbCollider._Dynamic = true;
    body.Gravity = createVector(0, 0);
    body.Velocity = createVector(0, 0);

    hero.Add(basicMover);
    hero.Add(aabbCollider);
    hero.Add(body);

    hero.Initialize();
  }

  Block(x, y, name = null) {
    let block = this.Space.Create("Block");
    if (name != null)
      block.Name = name;

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    block.Add(tx);

    let rect = new Rect();
    rect.Fill = color(100, 110, 115);
    block.Add(rect);

    let top = new Rect();
    top.Fill = color(200, 250, 220, 200);
    top.H = 1 / 8;
    top.Offset = createVector(0, (top.H - 1) / 2);
    block.Add(top);
    let left = new Rect();
    left.Fill = color(200, 250, 220, 100);
    left.W = top.H;
    left.Offset = createVector(top.Offset.y, top.Offset.x);
    block.Add(left);
    let right = new Rect();
    right.Fill = color(80, 50, 120, 100);
    right.W = left.W;
    right.Offset = createVector(-left.Offset.x, left.Offset.y);
    block.Add(right);
    let bottom = new Rect();
    bottom.Fill = color(80, 50, 120, 200);
    bottom.H = top.H;
    bottom.Offset = createVector(top.Offset.x, -top.Offset.y);
    block.Add(bottom);

    let aabbCollider = new AabbCollider();
    aabbCollider._Dynamic = false;

    block.Add(aabbCollider);
    block.Initialize();
  }

  LayeredBlock(x, y, name = null) {
    let block = this.Space.Create("Block");
    if (name != null)
      block.Name = name;

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    block.Add(tx);

    let layers = 6;
    let spacing = 1 / 3;
    for (let i = 0; i < layers; ++i) {
      let layer = new Rect();
      layer.Fill = color(0, 0, 100 + i * 25);
      layer.Offset = createVector(-i * spacing, -i * spacing);
      layer.Layer = 2 * i + 1;
      block.Add(layer);
    }

    let aabbCollider = new AabbCollider();
    aabbCollider._Dynamic = false;

    block.Add(aabbCollider);
    block.Initialize();
  }

  PlaceBlocks(array) {
    for (const pair of array) {
      this.Block(pair[0], pair[1], "Block " + this.BlockCount);
      ++this.BlockCount;
    }
  }

  CreateTileMap() {
    let tileMapCog = this.Space.Create("TileMapCog");

    let tx = new Tx();
    tileMapCog.Add(tx);
    let tileMap = new TileMap();
    tileMapCog.Add(tileMap);

    let block = new Tile(true, color(100, 110, 115));

    let tileArray =
      [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
        [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,],
        [1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1,],
        [1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,],
        [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,],
        [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
        [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
      ];
    let legend = [undefined, block];
    tileMap.ReadArray(tileArray, legend);
    tileMap.Offset = createVector(0.5, 0.5);
    tileMap.Solid = true;

    tileMapCog.Initialize();
  }
}

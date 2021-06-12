import { G } from "./main"
import Tx from "./Tx"
import { AabbCollider, Rect } from "./Cog";
import { Tile, TileMap } from "./TileMap";
import HotspotCollider from "./HotspotCollider"
import Space from "./Space"
import TileMapCollider from "./TileMapCollider";
import BasicMover from "./BasicMover";
import Body from "./Body"
import BasicPlatformerController from "./BasicPlatformerController";


export class Scene
{
  Space: Space = null;

  Load(space: Space)
  {
    this.Space = space;
  }
}


export class TestScene extends Scene
{
  BlockCount: number = 0;

  Load(space: Space)
  {
    super.Load(space);

    //     let blocks =
    //     [
    //       [5, 9], [6, 9], [7, 9], [8, 8], [9, 8], [10, 8],
    //     ];
    //     this.PlaceBlocks(blocks);

    this.Hero(5, 6);
    this.CreateTileMap();

    space.PhysicsSystem.Gravity = G.createVector(0, 30);
  }

  Hero(x: number, y: number)
  {
    let hero = this.Space.Create("Hero");

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    hero.Add(tx);

    let rect = new Rect();
    rect.Fill = G.color(200, 200, 50, 80);
    rect.Stroke = G.color(150, 150, 35, 200);
    rect.UseStroke = true;
    rect.UseFill = false;
    rect.StrokeWeight = 1/16;
    rect.W = 3/4;
    rect.H = 1;
    rect.Layer = 1;
    hero.Add(rect);

    // let basicMover = new BasicMover();
    let basicPlatformerController = new BasicPlatformerController();
    let aabbCollider = new AabbCollider();
    let body = new Body();
    // basicMover.Speed = 8;
    basicPlatformerController.JumpSpeed = -13.5;
    aabbCollider.Dynamic = true;
    body.Velocity = G.createVector(0, 0);
    let hotspotCollider = new HotspotCollider();
    hotspotCollider.W = rect.W;
    hotspotCollider.H = rect.H;
    // hotspotCollider.CornerThickness = 1/6;

    // hero.Add(basicMover);
    hero.Add(basicPlatformerController);
    hero.Add(aabbCollider);
    hero.Add(body);
    hero.Add(hotspotCollider);

    hero.Initialize();
  }

  LayeredHero(x: number, y: number)
  {
    let hero = this.Space.Create("Hero");

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    hero.Add(tx);

    let layers = 7;
    let spacing = 1 / 3;
    for (let i = 0; i < layers; ++i)
    {
      let layer = new Rect();
      layer.Fill = G.color(0, 100 + i * 25, 0);
      layer.Offset = G.createVector(-i * spacing, -i * spacing);
      layer.Layer = 2 * i;
      hero.Add(layer);
    }

    let basicMover = new BasicMover();
    let aabbCollider = new AabbCollider();
    let body = new Body();
    basicMover.Speed = 4;
    aabbCollider.Dynamic = true;
    body.Velocity = G.createVector(0, 0);

    hero.Add(basicMover);
    hero.Add(aabbCollider);
    hero.Add(body);

    hero.Initialize();
  }

  Block(x: number, y: number, name: string = null)
  {
    let block = this.Space.Create("Block");
    if (name != null)
      block.Name = name;

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    block.Add(tx);

    let rect = new Rect();
    rect.Fill = G.color(100, 110, 115);
    block.Add(rect);

    let top = new Rect();
    top.Fill = G.color(200, 250, 220, 200);
    top.H = 1 / 8;
    top.Offset = G.createVector(0, (top.H - 1) / 2);
    block.Add(top);
    let left = new Rect();
    left.Fill = G.color(200, 250, 220, 100);
    left.W = top.H;
    left.Offset = G.createVector(top.Offset.y, top.Offset.x);
    block.Add(left);
    let right = new Rect();
    right.Fill = G.color(80, 50, 120, 100);
    right.W = left.W;
    right.Offset = G.createVector(-left.Offset.x, left.Offset.y);
    block.Add(right);
    let bottom = new Rect();
    bottom.Fill = G.color(80, 50, 120, 200);
    bottom.H = top.H;
    bottom.Offset = G.createVector(top.Offset.x, -top.Offset.y);
    block.Add(bottom);

    let aabbCollider = new AabbCollider();
    aabbCollider._Dynamic = false;

    block.Add(aabbCollider);
    block.Initialize();
  }

  LayeredBlock(x: number, y: number, name: string = null)
  {
    let block = this.Space.Create("Block");
    if (name != null)
      block.Name = name;

    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    block.Add(tx);

    let layers = 6;
    let spacing = 1 / 3;
    for (let i = 0; i < layers; ++i)
    {
      let layer = new Rect();
      layer.Fill = G.color(0, 0, 100 + i * 25);
      layer.Offset = G.createVector(-i * spacing, -i * spacing);
      layer.Layer = 2 * i + 1;
      block.Add(layer);
    }

    let aabbCollider = new AabbCollider();
    aabbCollider._Dynamic = false;

    block.Add(aabbCollider);
    block.Initialize();
  }

  PlaceBlocks(array: [number, number][])
  {
    for (const pair of array)
    {
      this.Block(pair[0], pair[1], "Block " + this.BlockCount);
      ++this.BlockCount;
    }
  }

  CreateTileMap()
  {
    let tileMapCog = this.Space.Create("TileMapCog");

    let tx = new Tx();
    tileMapCog.Add(tx);
    let tileMap = new TileMap();
    tileMapCog.Add(tileMap);

    let emptyBlock = new Tile(0, 0, false, G.color(115, 110, 100, 50));
    let solidBlock = new Tile(0, 0, true, G.color(100, 110, 115));

    let indexArray =
    [
      // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
      // [1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1,],
      // [1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1,],
      // [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1,],
      // [1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1,],
      // [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1,],
      // [1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1,],
      // [1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
      // [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1],
      [1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];
    let legend: Tile[] = [emptyBlock, solidBlock];
    tileMap.ReadArray(indexArray, legend);
    tileMap.Offset = G.createVector(0.5, 0.5);

    let tileMapCollider = new TileMapCollider();
    tileMapCog.Add(tileMapCollider);

    tileMapCog.Initialize();
  }
}

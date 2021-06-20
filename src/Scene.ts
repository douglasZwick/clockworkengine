import { G } from "./main"
import Tx from "./Tx"
import AabbCollider from "./AabbCollider";
import { Tile, TileMap } from "./TileMap";
import HotspotCollider from "./HotspotCollider"
import Space from "./Space"
import TileMapCollider from "./TileMapCollider";
import BasicMover from "./BasicMover";
import Body from "./Body"
import BasicPlatformerController from "./BasicPlatformerController";
import ChangeColorOnCollision from "./ChangeColorOnCollision";
import { Rect } from "./Rect";
import Circle from "./Circle";
import CircleCollider from "./CircleCollider";
import Cog from "./Cog";
import { Key, InputFrame } from "./InputMaster"
import MoviePlaybackTester from "./MoviePlaybackTester";


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
    
    this.CreateTileMap();
    this.Hero(5, 6);

    // this.TopDownHero(5, 6, 0);
    this.Coin(12, 4, 0.5, 1);
    this.Coin(13.5, 4, 0.5, 1);
    this.Coin(15, 4, 0.5, 1);

    // let a = space.Create("A");
    // let txA = new Tx();
    // let rectA = new Rect();
    // txA.X = 5;
    // txA.Y = 3;
    // txA.Rotation = G.radians(15);
    // txA.ScaleX = 2;
    // txA.ScaleY = 0.7;
    // rectA.Fill = G.color(255, 255, 0, 100);
    // rectA.Layer = 1;
    // rectA.Offset = G.createVector(1, 0);
    // a.Add(txA);
    // a.Add(rectA);
    // a.Initialize();

    // let b = space.Create("B");
    // let txB = new Tx();
    // let rectB = new Rect();
    // txB.Position = txA.Position;
    // // txB.Scale = txA.Scale;
    // rectB.Fill = G.color(0, 128, 255, 255);
    // rectB.Layer = 0;
    // b.Add(txB);
    // b.Add(rectB);
    // b.Initialize();

    let testCog = space.Create("MovieTester");
    let tester = new MoviePlaybackTester();
    testCog.Add(tester);
    testCog.Initialize();

    space.PhysicsSystem.Gravity = G.createVector(0, -30);
  }

  TopDownHero(x: number, y: number, colliderType: 0 | 1): Cog
  {
    let hero = this.Space.Create("Hero");
    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    hero.Add(tx);

    if (colliderType === 0)
    {
      let rect = new Rect();
      rect.W = rect.H = 2;
      rect.Fill = G.color(20, 100, 200);
      rect.Layer = 0;
      hero.Add(rect);
      let aabbCollider = new AabbCollider();
      aabbCollider.W = aabbCollider.H = rect.W;
      aabbCollider.Dynamic = true;
      hero.Add(aabbCollider);
    }
    else
    {
      let circle = new Circle();
      circle.Radius = 1;
      circle.Fill = G.color(20, 100, 200);
      circle.Layer = 0;
      hero.Add(circle);
      let circleCollider = new CircleCollider();
      circleCollider.Radius = circle.Radius;
      circleCollider.Dynamic = true;
      hero.Add(circleCollider);
    }

    let mover = new BasicMover();
    mover.Speed = 4;
    hero.Add(mover);
    hero.Initialize();
    return hero;
  }

  Hero(x: number, y: number): Cog
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
    basicPlatformerController.JumpSpeed = 13.5;
    aabbCollider.Dynamic = true;
    aabbCollider.W = rect.W;
    aabbCollider.H = rect.H;
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

    return hero;
  }

  Coin(x: number, y: number, radius: number, colliderType: 0 | 1): Cog
  {
    let coin = this.Space.Create("Coin");
    let tx = new Tx();
    tx.X = x;
    tx.Y = y;
    coin.Add(tx);
    let circle = new Circle();
    circle.Radius = radius;
    circle.Fill = G.color(250, 220, 20);
    circle.Layer = 1;
    coin.Add(circle);

    if (colliderType === 0)
    {
      let aabbCollider = new AabbCollider();
      aabbCollider.W = aabbCollider.H = radius * 2;
      coin.Add(aabbCollider);
    }
    else
    {
      let circleCollider = new CircleCollider();
      circleCollider.Radius = radius;
      coin.Add(circleCollider);
    }

    let colorChanger = new ChangeColorOnCollision();
    coin.Add(colorChanger);
    coin.Initialize();
    return coin;
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

    let emptyBlock = new Tile(0, 0, false, G.color(115, 110, 100, 32));
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
      [1, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
      [1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
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

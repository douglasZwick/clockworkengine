import Component from "./Component";
import { TileMap } from "./TileMap";


export default class TileMapCollider extends Component
{
  TileMap: TileMap;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Initialize()
  {
    super.Initialize();

    this.TileMap = this.Owner.Get(TileMap);
    this.Space.PhysicsSystem.AddTileMapCollider(this);
  }

  CleanUp()
  {
    this.Space.PhysicsSystem.RemoveTileMapCollider(this);
  }
}

import Component from "./Component";
import Body from "./Body";
import { IM } from "./Engine";
import { Key } from "./InputMaster";
import HotspotCollider from "./HotspotCollider";


export default class BasicPlatformerController extends Component
{
  MovementSpeed: number = 8;
  JumpSpeed: number = -10;
  Body: Body = null;
  HotspotCollider: HotspotCollider = null;
  HeadIndexA: number = 2;
  HeadIndexB: number = 3;
  FootIndexA: number = 6;
  FootIndexB: number = 7;
  PrevHeadContact: boolean = false;
  PrevFootContact: boolean = false;

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  get HeadContact()
  {
    return this.HotspotCollider.HotspotsTriggered[this.HeadIndexA] ||
           this.HotspotCollider.HotspotsTriggered[this.HeadIndexB];
  }

  get FootContact()
  {
    return this.HotspotCollider.HotspotsTriggered[this.FootIndexA] ||
           this.HotspotCollider.HotspotsTriggered[this.FootIndexB];
  }

  Initialize()
  {
    this.Body = this.Owner.Get(Body.name) as Body;
    this.HotspotCollider = this.Owner.Get(HotspotCollider.name) as HotspotCollider;
  }

  LogicUpdate(dt: number)
  {
    if (!this.Active) return;

    let movement = 0;

    if (IM.Down(Key.Right))
      movement += 1;
    if (IM.Down(Key.Left))
      movement -= 1;
    
    this.Tx.AddX(movement * this.MovementSpeed * dt);

    if (IM.Pressed(Key.S))
      this.AttemptJump();
  }

  LateUpdate(dt: number)
  {
    let headContact = this.HeadContact;
    let footContact = this.FootContact;

    if (footContact)
    {
      if (this.Body._Velocity.y > 0)
        this.Body._Velocity.y = 0;

      if (!this.PrevFootContact)
        this.Land();
    }

    if (headContact)
    {
      if (this.Body._Velocity.y < 0)
        this.Body._Velocity.y = 0;

      if (!this.PrevHeadContact)
        this.Bonk();
    }

    this.PrevHeadContact = headContact;
    this.PrevFootContact = footContact;
  }

  AttemptJump()
  {
    if (this.FootContact)
      this.Jump();
  }

  Jump()
  {
    this.Body._Velocity.y = this.JumpSpeed;
  }

  Land()
  {
    
  }

  Bonk()
  {

  }
}

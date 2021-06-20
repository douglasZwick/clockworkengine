import Component from "./Component";
import { ImMode, InputFrame, Key } from "./InputMaster";
import Engine, { IM } from "./Engine"


export default class MoviePlaybackTester extends Component
{
  Movie: InputFrame[] = [];

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  Initialize()
  {
    this.Owner.Persistent = true;
  }

  LogicUpdate(dt: number)
  {
    if (IM.Mode === ImMode.Replay) return;

    if (IM.Pressed(Key.One))
      this.BeginRecording();
    else if (IM.Pressed(Key.Two))
      this.EndRecording();
    else if (IM.Pressed(Key.Three))
      this.Play();
  }

  BeginRecording()
  {
    // TODO:
    //   Rewrite this as a part of the IM itself or something. ORRRRR
    //   get around to making Space extend Cog so that I can add this
    //   component to the space instead
    IM.BeginRecording();
  }

  EndRecording()
  {
    this.Movie = IM.EndRecording();
  }

  Play()
  {
    IM.PlayMovie(this.Movie);
  }
}

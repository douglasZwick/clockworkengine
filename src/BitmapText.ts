import P5 from "p5";
import BitmapFont from "./BitmapFont";
import Engine from "./Engine";
import Graphical from "./Graphical";
import { G } from "./main";

export default class BitmapText extends Graphical
{
  BitmapFont: BitmapFont;
  Text: string = "";
  HAlign: TextAlign.Left | TextAlign.Center | TextAlign.Right = TextAlign.Left;
  VAlign: TextAlign.Top | TextAlign.Center | TextAlign.Bottom = TextAlign.Top;
  Color: P5.Color = G.color(255);
  Shadowed: boolean = false;
  Waving: boolean = false;
  WaveMinZ: number = 0;
  WaveMaxZ: number = 4;
  WavePeriod: number = 1;
  ShadowColor: P5.Color = G.color(0, 0, 0, 255);

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  static IsPrintable(char: string): boolean
  {
    const code = char.codePointAt(0);
    if (code <= 0x20) return false;
    if (code == 0x81) return false;
    if (code == 0x8D) return false;
    if (code == 0x8F) return false;
    if (code == 0x90) return false;
    if (code == 0x9D) return false;
    if (code == 0xA0) return false;
    if (code == 0xAD) return false;
    return true;
  }

  static IsSpace(char: string): boolean
  {
    return char === " ";
  }

  static IsNewline(char: string): boolean
  {
    return char === "\n";
  }

  Render()
  {
    G.push();

    G.tint(this.Color);
    G.scale(1, -1, 1);

    let x = 0;
    let y = 0;
    let spread = [...this.Text];
    for (const item of spread)
    {
      let code = item.codePointAt(0);
      let char = this.BitmapFont.Chars[code];

      if (!BitmapText.IsPrintable(item))
      {
        if (BitmapText.IsSpace(item))
        {
          x += char.Width;
        }
        else if (BitmapText.IsNewline(item))
        {
          x = 0;
          y += this.BitmapFont.EmHeight;
        }

        continue;
      }
      
      let image = this.BitmapFont.ImageSource.Image;
      let currX = x - char.Front;
      let currY = y;
      let w = this.BitmapFont.EmWidth;
      let h = this.BitmapFont.EmHeight;
      let sx = w * G.int(code % this.BitmapFont.Cols);
      let sy = h * G.int(code / this.BitmapFont.Rows);
      let actualX = currX;
      let actualY = currY;
      let actualZ = 0;

      if (this.Waving)
      {
        let t = Engine.ElapsedTime;
        let phi = currX;
        let numerator = 1 - G.cos(G.TAU * (t + phi) / this.WavePeriod);
        actualZ = (this.WaveMaxZ - this.WaveMinZ) * numerator / 2 + this.WaveMinZ;
        actualX -= actualZ;
        actualY -= actualZ;
      }

      if (this.Shadowed)
      {
        G.push();

        let shadowAlpha = (1 - (actualZ - this.WaveMinZ) / (this.WaveMaxZ - this.WaveMinZ)) * 255;
        G.tint(0, shadowAlpha);
        let d = 1;
        G.image(image, currX + 0, currY + 0, w, h, sx, sy, w, h);
        G.image(image, currX + d, currY + 0, w, h, sx, sy, w, h);
        G.image(image, currX + 0, currY + d, w, h, sx, sy, w, h);
        G.image(image, currX + d, currY + d, w, h, sx, sy, w, h);

        G.pop();
      }

      G.image(image, actualX, actualY, w, h, sx, sy, w, h);
      
      x += char.Width;
    }

    G.pop();
  }
}


export enum TextAlign
{
  Left,
  Right,
  Top,
  Bottom,
  Center,
}

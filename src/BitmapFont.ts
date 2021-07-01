import ImageSource from "./ImageSource";


export default class BitmapFont
{
  Name: string;
  EmWidth: number;
  EmHeight: number;
  Cols: number;
  Rows: number;
  Chars: BitmapChar[];
  ImageSource: ImageSource;
}

export class BitmapChar
{
  Code: number;
  Char: string;
  Width: number;
  Front: number;
}

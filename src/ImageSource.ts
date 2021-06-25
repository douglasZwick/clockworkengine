import P5 from "p5";


export default class ImageSource
{
  Image: P5.Image;
  PixelsPerUnit: number = 32;

  constructor(image: P5.Image, pixelsPerUnit: number)
  {
    this.Image = image;
    this.PixelsPerUnit = pixelsPerUnit;
  }

  get W() { return this.Image.width / this.PixelsPerUnit; }
  get H() { return this.Image.height / this.PixelsPerUnit; }
}

import P5 from "p5";
import { G } from "./main";
import ImageSource from "./ImageSource";
import Engine from "./Engine";
import Resources from "./Resources";


export default class ImageLoader
{
  ImagesDirectory: string = "./src/Images/";

  LoadImages()
  {
    // @ts-ignore
    for (const fileName of _imageList as string[])
    {
      let imageName = fileName.split('.').slice(0, -1).join('.');
      let fullPath = this.ImagesDirectory + fileName;
      console.log(fullPath);
      let image = G.loadImage(fullPath);
      let imageSource = new ImageSource(image, Engine.Meter / 2);
      Resources.Images.set(imageName, imageSource);
    }
  }
}

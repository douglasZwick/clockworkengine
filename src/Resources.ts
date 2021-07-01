import { G } from "./main";
import Engine from "./Engine";
import ImageSource from "./ImageSource";
import BitmapFont from "./BitmapFont";


export default class Resources
{
  static Images = new Map<string, ImageSource>();
  static BitmapFonts = new Map<string, BitmapFont>();


  static async Load()
  {
    Resources.LoadImages();
    await Resources.LoadBitmapFonts();
  }

  static LoadImages()
  {
    console.log("Loading images...");
    let imageCount = 0;

    // @ts-ignore
    for (const filePath of _imageList as string[])
    {
      let imageName = filePath.replace(/^.*[\\\/]/, '').split(".")[0];
      let image = G.loadImage(filePath);
      let imageSource = new ImageSource(image, Engine.Meter / 2);
      Resources.Images.set(imageName, imageSource);

      ++imageCount;
    }

    console.log(` ** Loaded ${imageCount} images.`);
  }

  static async LoadBitmapFonts()
  {
    // TODO:
    //   use Josh's code to optimize this --
    /*
      async LoadFiles() {
        const promises = []

        // @ts-ignore
        for (const filePath of _globalContentList as string[]) {
            promises.push(this.LoadResource(filePath))
        }
        await Promise.all(promises)
      }

      async LoadResource(filePath) {
        const result = await fetch(filePath)
        const text = await result.text()
        // do whatever
      }
    */
    // also double-check that Promise.all isn't saying we're ready
    //   before the await result.text is done
    console.log("Loading bitmap fonts...");
    let bitmapFontCount = 0;

    // @ts-ignore
    for (const filePath of _bitmapFontList as string[])
    {
      let bitmapFontName = filePath.replace(/^.*[\\\/]/, '').split(".")[0];
      const response = await fetch(filePath);
      const fileText = await response.text();
      let bitmapFont = JSON.parse(fileText) as BitmapFont;
      bitmapFont.ImageSource = Resources.Images.get(bitmapFontName);
      Resources.BitmapFonts.set(bitmapFontName, bitmapFont);

      ++bitmapFontCount;
    }

    console.log(` ** Loaded ${bitmapFontCount} bitmap fonts.`)
  }
}

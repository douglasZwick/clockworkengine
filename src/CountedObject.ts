import Engine from "./Engine"


// A CountedObject is anything with a unique Id
export default class CountedObject
{
  Id: number;

  constructor()
  {
    // By getting the engine's NextId,
    //   this object's Id is always unique
    this.Id = Engine.NextId();
  }
}

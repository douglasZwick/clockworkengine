import P5 from "p5"
import Component from "./Component";
import { G } from "./main";
import { Contact } from "./PhysicsSystem";


// Base Collider class. Use by the PhysicsSystem to
//   check if this Cog is touching other Cogs, etc.
export default class Collider extends Component
{
  // Colliders are either dynamic or static
  _Dynamic: boolean = false;
  // Applied to Tx position before collision checks
  _Offset: P5.Vector = G.createVector();
  // List of all contacts this Collider currently has with other Colliders
  Contacts: Contact[] = [];

  constructor()
  {
    super();

    this.Name = this.constructor.name;
  }

  // Interface for changing whether something is
  //   dynamic or static at runtime
  get Dynamic() { return this._Dynamic; }
  set Dynamic(dynamic)
  {
    if (this.Initialized)
    {
      if (dynamic !== this._Dynamic)
      {
        this.Space.PhysicsSystem.RemoveCollider(this);
        this._Dynamic = dynamic;
        this.Space.PhysicsSystem.AddCollider(this);
      }
    }
    else
    {
      this._Dynamic = dynamic;
    }
  }

  // Access _Offset by copy
  get Offset() { return this._Offset.copy(); }
  // Access _Offset by copy
  set Offset(offset) { this._Offset = offset.copy(); }

  // Adds this Collider to the PhysicsSystem
  Initialize()
  {
    super.Initialize();

    this.Space.PhysicsSystem.AddCollider(this);
  }

  // Adds a new contact. Called when a collision starts
  AddContact(contact: Contact)
  {
    this.Contacts.push(contact);
  }

  // Checks whether this Collider is already touching the given Collider
  ContactExistsWith(collider: Collider): boolean
  {
    let find = (contact: Contact): boolean =>
    { return contact.OtherCollider.Id === collider.Id; };

    return this.Contacts.find(find) !== undefined;
  }

  // Removes any contact that may exist with the given Collider
  PruneContactWith(collider: Collider): boolean
  {
    let find = (contact: Contact): boolean =>
    { return contact.OtherCollider.Id === collider.Id; };

    // First, find whether such a contact exists
    let index = this.Contacts.findIndex(find);

    // If nothing was found, return false
    if (index < 0)
      return false;

    // Otherwise, prune that contact from this list and return true
    this.Contacts[index] = this.Contacts[this.Contacts.length - 1];
    --this.Contacts.length;

    return true;
  }

  // Removes this Collider from the PhysicsSystem.
  //   Important to do this before we lose access to this Component!
  CleanUp()
  {
    this.Space.PhysicsSystem.RemoveCollider(this);
  }
}

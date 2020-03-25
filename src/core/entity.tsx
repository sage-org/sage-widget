/* file: entity.tsx
MIT License

Copyright (c) 2019-2020 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the 'Software'), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import uuid from 'uuid/v4'

/**
 * An entity in the domain
 * @author Thomas Minier
 */
export default abstract class Entity {
  private _id: string

  constructor () {
    this._id = uuid()
  }

  /**
   * Get an unique ID representing the entity
   * @return An unique identifier
   */
  getID (): string {
    return this._id
  }

  /**
   * Get a string serialization of the entity
   * @return The entity serialized as a string
   */
  abstract toString (): string

  /**
   * Test if two entities are equals
   * @param other - Entity to compare with
   * @return True if the two entities are equals, False otherwise
   */
  equals (other: Entity): boolean {
    return this.getID() === other.getID()
  }
}

/* file: bindings-repo.tsx
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

import Bindings from './bindings'

type OnAddListener = (item?: Bindings) => void

/**
 * A repository of solution bindings
 * @author Thomas Minier
 */
export default class BindingsRepository {
  private _content: Bindings[]
  private _listeners: OnAddListener[]

  constructor () {
    this._content = []
    this._listeners = []
  }

  onAdd (listener: OnAddListener): void {
    this._listeners.push(listener)
  }
  
  /**
   * Add a set of solution bindings to the repository
   * @param bindings - Bindings to add
   */
  add (bindings: Bindings): void {
    this._content.push(bindings)
    this._listeners.forEach(cb => cb(bindings))
  }

  /**
   * Get the whole content of the repository, with an optimal offset & limit
   * @param offset - How many items to skip
   * @param limit - Maximum number of items to fetch
   * @return The desired slice of the repository's content
   */
  findAll (offset?: number, limit?: number): Bindings[] {
    const start = (offset === undefined) ? 0 : offset
    if (limit !== undefined) {
      return this._content.slice(start, limit)
    }
    return this._content.slice(start)
  }
}

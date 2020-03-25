/* file: bindings.tsx
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

import Entity from '../core/entity'

export default class Bindings extends Entity {
  private _content: Map<string, string>

  constructor () {
    super()
    this._content = new Map()
  }

  get variables (): string[] {
    return Array.from(this._content.keys())
  }

  get (key: string): string | undefined {
    return this._content.get(key)
  }

  set (key: string, term: string): void {
    this._content.set(key, term)
  }

  has (key: string): boolean {
    return this._content.has(key)
  }

  map<T> (mapper: (key: string, value: string) => T): T[] {
    const res: T[] = []
    this._content.forEach((value: string, key: string) => res.push(mapper(key, value)))
    return res
  }

  toString (): string {
    let res = '{'
    this._content.forEach((value: string, key: string) => res += `${key}->${value},`)
    return res + '}'
  }
}
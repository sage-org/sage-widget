/* file: graph.ts
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
import PresetQuery from './preset-query'

/**
 * A RDF Graph, as found in a VOID file
 * @author Thomas Minier
 */
export default class Graph extends Entity {
  private _name: string
  private _description: string
  private _url: string
  private _presetQueries: PresetQuery[]

  constructor (name: string, description: string, url: string) {
    super()
    this._name = name
    this._description = description
    this._url = url
    this._presetQueries = []
  }

  /**
   * The name of the RDF Graph
   */
  get name (): string {
    return this._name
  }

  /**
   * The description of the RDF Graph
   */
  get description (): string {
    return this._description
  }

  /**
   * The URL/URI of the RDF Graph
   */
  get url (): string {
    return this._url
  }

  /**
   * The collection of preset queries that can be executed on this graph
   */
  get presetQueries (): PresetQuery[] {
    return this._presetQueries
  }

  addPresetQuery(query: PresetQuery): void {
    this._presetQueries.push(query)
  }

  toString(): string {
    return `Graph<${this._url}>`
  }
}

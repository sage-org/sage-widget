/* file: preset-query.tsx
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

/**
 * A preset query is a SPARQL query with a default RDF Graph provided by the VoID
 * to illustrate the usage of a RDF dataset
 * @author Thomas Minier
 */
export default class PresetQuery extends Entity {
  private _name: string
  private _query: string
  private _defaultGraph: string

  constructor (name: string, query: string, defaultGraph: string) {
    super()
    this._name = name
    this._query = query
    this._defaultGraph = defaultGraph
  }

  /**
   * The SPARQL query itself
   */
  get query (): string {
    return this._query
  }

  /**
   * The default RDF Graph on which the query should be executed
   */
  get defaultGraph (): string {
    return this._defaultGraph
  }

  toString (): string {
    return `PresetQuery(${this._query}@<${this._defaultGraph}>)`
  }
}

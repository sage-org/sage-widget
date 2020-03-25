/* file: query-config.tsx
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

/**
 * The configuration built before executing a SPARQL query
 * @author Thomas Minier
 */
export default class QueryConfiguration {
  private _serverURL: string | null
  private _defaultGraph: string | null
  private _sparqlQuery: string | null

  constructor () {
    this._serverURL = null
    this._defaultGraph = null
    this._sparqlQuery = null
  }

  /**
   * The SaGe server URL used to evaluate the SPARQL query
   */
  get serverURL (): string | null {
    return this._serverURL
  }

  set serverURL (value: string | null) {
    this._serverURL = value
  }

  /**
   * The URI of the default RDF Graph used to evaluate the SPARQL query
   */
  get defaultGraph (): string | null {
    return this._defaultGraph
  }

  set defaultGraph (value: string | null) {
    this._defaultGraph = value
  }

  /**
   * The SPARQL query to execute
   */
  get sparqlQuery (): string | null {
    return this._sparqlQuery
  }

  set sparqlQuery (value: string | null) {
    this._sparqlQuery = value
  }

  /**
   * Reset the configuration back to its original state
   */
  reset (): void {
    this._serverURL = null
    this._defaultGraph = null
    this._sparqlQuery = null
  }
}

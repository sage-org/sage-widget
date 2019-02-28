/* file : plan-visitor.js
MIT License

Copyright (c) 2019 Thomas Minier

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict'

export default class PlanVisitor {
  visitRoot (node) {
    this._visitChildren(node, 'Source')
  }

  _visitChildren (node, suffix = 'Source') {
    if (`proj${suffix}` in node) {
      this._visitProjection(node[`proj${suffix}`])
    } else if (`scan${suffix}` in node) {
      this._visitScan(node[`scan${suffix}`])
    } else if (`join${suffix}` in node) {
      this._visitIndexJoin(node[`join${suffix}`])
    } else if (`union${suffix}` in node) {
      this._visitBagUnion(node[`union${suffix}`])
    } else if (`filter${suffix}` in node) {
      this._visitFilter(node[`filter${suffix}`])
    }
  }

  _visitScan (node) {}

  _visitProjection (node) {
    this._visitChildren(node, 'Source')
  }

  _visitIndexJoin (node) {
    this._visitChildren(node, 'Source')
  }

  _visitFilter (node) {
    this._visitChildren(node, 'Source')
  }

  _visitBagUnion (node) {
    this._visitChildren(node, 'Left')
    this._visitChildren(node, 'Right')
  }
}

/* file : basic-visitor.js
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

import PlanVisitor from './plan-visitor'
import { isEqual } from 'lodash'

export default class BasicVisitor extends PlanVisitor {
  constructor () {
    super()
    this._value = 0
    this._visitedPatterns = []
    this._shouldUpdatePattern = true
  }

  get estimatedProgress () {
    return this._value
  }

  stopRecordingPatterns () {
    this._shouldUpdatePattern = false
  }

  _visitScan (node) {
    if (this._shouldUpdatePattern) {
      this._visitedPatterns.push(node.triple)
    }
    if (this._visitedPatterns.findIndex(p => isEqual(node.triple, p)) > -1) {
      this._value = (parseInt(node.lastRead, 10) / node.cardinality) * 100
    }
  }

  _visitBagUnion (node) {
    this._visitChildren(node, 'Left')
    const leftValue = this._value
    this._visitChildren(node, 'Right')
    const rightValue = this._value
    this._value = (leftValue + rightValue) / 2
  }
}

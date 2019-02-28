/* file : monitoring.js
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

import protobuf from 'protobufjs'
import descriptor from '../monitoring/iterators.json'
import BasicVisitor from './basic-visitor'

const root = protobuf.Root.fromJSON(descriptor)
const RootTree = root.lookupType('RootTree')

export function estimateProgress () {
  const visitor = new BasicVisitor()
  return function (nextLink) {
    try {
      const plan = RootTree.decode(Buffer.from(nextLink, 'base64'))
      // compute progression using visitor
      visitor.visitRoot(RootTree.toObject(plan))
      visitor.stopRecordingPatterns()
      return Number.parseFloat(visitor.estimatedProgress).toPrecision(6)
    } catch (e) {
      return 0
    }
  }
}

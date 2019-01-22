/* file : features.js
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

export const FEATURES = {
  DISTINCT: 'feature_distinct',
  OPTIONAL: 'feature_optional',
  SERVICE: 'feature_service',
  LIMIT: 'feature_limit',
  FILTER: 'feature_filter'
}

// extract features from a SPARQL query
export function extractFeatures (query) {
  const q = query.toLowerCase()
  const features = []
  if (q.includes('service')) {
    features.push(FEATURES.SERVICE)
  }
  if (q.includes('distinct')) {
    features.push(FEATURES.DISTINCT)
  }
  if (q.includes('optional')) {
    features.push(FEATURES.OPTIONAL)
  }
  if (q.includes('filter')) {
    features.push(FEATURES.FILTER)
  }
  if (q.includes('limit')) {
    features.push(FEATURES.LIMIT)
  }
  return features
}

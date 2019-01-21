/* file : void.js
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
import { extractFeatures } from './features.js'
import { DCTERMS, HYDRA, SAGE, SD, RDF, RDFS } from './rdf.js'
import { groupBy, map, sortBy } from 'lodash'

// fetch the VoID description of a server
export function fetchVoID (url) {
  if (url.endsWith('/')) {
    url = url.substring(0, url.length - 1)
  }
  const headers = new Headers()
  headers.append('Accept', 'application/json')
  const request = new Request(`${url}/void`, {
    headers
  })
  return fetch(request)
    .then(res => res.json())
    .then(body => {
      const m = new Map()
      body.forEach(entity => {
        m.set(entity['@id'], entity)
      })
      return formatVoID(url, m)
    })
}

// format a VoID description to the format used by the SaGe widget
function formatVoID (url, descriptor) {
  const root = descriptor.get(url)
  const graphCollec = root[SD('availableGraphs')][0]
  // get all graphs provided by the Sage endpoint
  const graphs = descriptor
    .get(graphCollec['@id'])[SD('namedGraph')]
    .map(g => {
      const id = descriptor.get(g['@id'])[SD('graph')][0]['@id']
      return descriptor.get(id)
    })
  const urls = sortBy(graphs.map(g => {
    return {
      name: g[DCTERMS('title')][0]['@value'],
      url: g[HYDRA('entrypoint')][0]['@id']
    }
  }), ['name'])
  let queries = []
  graphs.forEach(g => {
    if (SAGE('hasExampleQuery') in g) {
      g[SAGE('hasExampleQuery')]
        .map(x => descriptor.get(x['@id']))
        .forEach(q => {
          queries.push({
            url: g[HYDRA('entrypoint')][0]['@id'],
            dataset: g[DCTERMS('title')][0]['@value'],
            name: q[RDFS('label')][0]['@value'],
            value: q[RDF('value')][0]['@value'],
            features: extractFeatures(q[RDF('value')][0]['@value'])
          })
        })
    }
  })
  // group and sort queries by dataset
  queries = groupBy(queries, 'dataset')
  queries = sortBy(map(queries, function (v, k) {
    return {
      dataset: k,
      queries: sortBy(v, ['name'])
    }
  }), function (v) {
    return v.dataset
  })
  return {urls, queries}
}

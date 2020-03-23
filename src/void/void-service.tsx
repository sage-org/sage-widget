/* file: void-service.ts
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

import Dataset from './dataset'
import Graph from './graph'
import axios from 'axios'
import { DCTERMS, HYDRA, SAGE, SD, RDF, RDFS } from './rdf-service'

const AVAILABLE_GRAPHS = 'http://www.w3.org/ns/sparql-service-description#availableGraphs'

interface URI {
  "@id": string
}

interface Literal {
  "@value": string
}

interface VoIDEntity extends URI {
  "@type": string[],
}

interface VoIDDataset extends VoIDEntity {
  "http://purl.org/dc/terms/maintainer": Literal[],
  "http://purl.org/dc/terms/title": Literal[],
  "http://www.w3.org/ns/sparql-service-description#availableGraphs": URI[],
  "http://xmlns.com/foaf/0.1/homepage":  URI[]
}

interface VoIDGraphList extends VoIDEntity {
  "http://www.w3.org/ns/sparql-service-description#namedGraph": URI[]
}

interface VoIDGraph extends VoIDEntity {
  "http://www.w3.org/ns/sparql-service-description#name": URI[],
  "http://www.w3.org/ns/sparql-service-description#graph": URI[]
}

export default class VoIDService {
  static async queryVoID (url: string): Promise<Dataset> {
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json'
      }
    })
    const entities = new Map<string, any>()
    response.data.forEach((entity: any) => {
      entities.set(entity['@id'], entity)
    })

    let datasetURI: string = url
    if (url.endsWith('/void')) {
      datasetURI = url.substring(0, url.length - 5)
    } else if (url.endsWith('/void/')) {
      datasetURI = url.substring(0, url.length - 6)
    }
    if (!entities.has(datasetURI)) {
      throw new Error(`The provided URL ${datasetURI} does not match any RDF dataset in the VoID file download.`)
    }
    
    const datasetEntity: VoIDDataset = entities.get(datasetURI)!
    const dataset = new Dataset(datasetEntity['http://purl.org/dc/terms/title'][0]['@value'])
    const allGraphs: VoIDGraphList = entities.get(datasetEntity[AVAILABLE_GRAPHS][0]['@id'])
    allGraphs['http://www.w3.org/ns/sparql-service-description#namedGraph'].map(uri => {
      return entities.get(uri['@id']) as VoIDGraph
    })
    .forEach((graphEntity: VoIDGraph) => {
      const graphName = graphEntity['http://www.w3.org/ns/sparql-service-description#name'][0]['@id']
      const graphURL = graphEntity['http://www.w3.org/ns/sparql-service-description#graph'][0]['@id']
      const graphDescription = ''
      dataset.addGraph(new Graph(graphName, graphDescription, graphURL))
    })
    return dataset
  }
}

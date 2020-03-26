/* file: dataset-factory.ts
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

import VoidFactory from './void-factory'
import Dataset from './dataset'
import Graph from './graph'
import { VoIDEntity, VoIDDataset, VoIDGraph, VoIDGraphList } from './void-entities'
import HTTPClient from '../http/http-client'
import GraphFactory from './graph-factory'

const DC_TITLE = 'http://purl.org/dc/terms/title'
const SS_AVAILABLE_GRAPHS = 'http://www.w3.org/ns/sparql-service-description#availableGraphs'
const SS_NAMED_GRAPHS = 'http://www.w3.org/ns/sparql-service-description#namedGraph'

/**
 * A Factory used to build RDF Datasets from VoID files
 * @author Thomas Minier
 */
export default class DatasetFactory implements VoidFactory<Dataset> {
  /**
   * Build a RDF Dataset by dereferencing a VoID file
   * @param url - URL of the VoID file
   * @return A RDF Dataset built from the input VoID file
   */
  async fromURI (url: string): Promise<Dataset> {
    const response = await HTTPClient.fetchJSON<VoIDEntity[]>(url)
    const entities = new Map<string, VoIDEntity>()
    response.forEach((entity: VoIDEntity) => {
      entities.set(entity['@id'], entity)
    })
    return this.fromVoID(url, entities)
  }

  /**
   * Build a RDF Dataset from the content of a VoID file
   * @param entityURI - URI of the RDF dataset in the VoID file
   * @param entities - Content of the VoID file
   * @return A RDF Dataset built from the input VoID file
   */
  fromVoID (entityURI: string, entities: Map<string, VoIDEntity>): Dataset {
    let datasetURI: string = entityURI
    if (entityURI.endsWith('/void')) {
      datasetURI = entityURI.substring(0, entityURI.length - 5)
    } else if (entityURI.endsWith('/void/')) {
      datasetURI = entityURI.substring(0, entityURI.length - 6)
    }
    if (!entities.has(datasetURI)) {
      throw new Error(`The provided URL ${datasetURI} does not match any RDF dataset in the VoID file download.`)
    }
    
    const datasetEntity: VoIDDataset = entities.get(datasetURI)! as VoIDDataset
    const dataset = new Dataset(datasetEntity[DC_TITLE][0]['@value'])

    const allGraphURI = datasetEntity[SS_AVAILABLE_GRAPHS][0]['@id']
    if (!entities.has(allGraphURI)) {
      throw new Error(`The RDF entity with URI <${allGraphURI}> is missing from the VoID downloaded`)
    }
    const graphFactory = new GraphFactory()
    const allGraphs: VoIDGraphList = entities.get(datasetEntity[SS_AVAILABLE_GRAPHS][0]['@id']) as VoIDGraphList
    allGraphs[SS_NAMED_GRAPHS]
      .filter(uri => entities.has(uri['@id']))
      .map(uri => graphFactory.fromVoID(uri['@id'], entities))
      .forEach((graph: Graph) => {
        dataset.addGraph(graph)
        // const graph = graphFactory.fromVoID(graphEntity['@id'], descriptor)
        // dataset.addGraph(new Graph(graphName, graphDescription, graphURL))
      })
    return dataset
  }
}

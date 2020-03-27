/* file: graph-factory.tsx
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
import Graph from './graph'
import PresetQuery from './preset-query'
import { VoIDEntity, VoIDGraph, VoIDPresetQuery } from './void-entities'

const DC_DESCRIPTION = 'http://purl.org/dc/terms/description'
const DC_TITLE = 'http://purl.org/dc/terms/title'
const HYDRA_ENTRYPOINT = 'http://www.w3.org/ns/hydra/core#entrypoint'
const RDF_LABEL = 'http://www.w3.org/2000/01/rdf-schema#label'
const RDFS_VALUE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value'
const SAGE_EXAMPLE_QUERY = 'http://sage.univ-nantes.fr/sage-voc#hasExampleQuery'

/**
 * A Factory used to build RDF Graphs from VoID files
 * @author Thomas Minier
 */
export default class GraphFactory implements VoidFactory<Graph> {
  /**
   * Build a RDF Graph from the content of a VoID file
   * @param entityURI - URI of the RDF Graph in the VoID file
   * @param entities - Content of the VoID file
   * @return A RDF Graph built from the input VoID file
   */
  fromVoID (entityURI: string, entities: Map<string, VoIDEntity>): Graph {
    const graphEntity = entities.get(entityURI) as VoIDGraph
    const graphName = graphEntity[DC_TITLE][0]['@value']
    const graphURL = graphEntity[HYDRA_ENTRYPOINT][0]['@id']
    const graphDescription = graphEntity[DC_DESCRIPTION][0]['@value']
    const graph = new Graph(graphName, graphURL, graphDescription)
    
    // build preset queries for this graph
    if (SAGE_EXAMPLE_QUERY in graphEntity) {
      graphEntity[SAGE_EXAMPLE_QUERY]!
        .filter(uri => entities.has(uri['@id']))
        .map(uri => entities.get(uri['@id']) as VoIDPresetQuery)
        .forEach((presetQuery: VoIDPresetQuery) => {
          const queryName = presetQuery[RDF_LABEL][0]['@value']
          const queryValue = presetQuery[RDFS_VALUE][0]['@value']
          graph.addPresetQuery(new PresetQuery(queryName, queryValue, graph.url))
        })
    }
    return graph
  }
}

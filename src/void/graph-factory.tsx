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
import { VoIDEntity, VoIDGraph } from './void-entities'

const SS_NAME = 'http://www.w3.org/ns/sparql-service-description#name'
const SS_GRAPH = 'http://www.w3.org/ns/sparql-service-description#graph'

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
    const graphName = graphEntity[SS_NAME][0]['@id']
    const graphURL = graphEntity[SS_GRAPH][0]['@id']
    const graphDescription = ''
    const graph = new Graph(graphName, graphURL, graphDescription)
    return graph
  }
}

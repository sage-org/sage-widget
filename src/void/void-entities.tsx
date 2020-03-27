/* file: void-entities.tsx
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
 * An RDF URI in JSON-LD format
 * @author Thomas Minier
 */
export interface URI {
  "@id": string
}

/**
 * An RDF Literal in JSON-LD format
 * @author Thomas Minier
 */
export interface Literal {
  "@value": string
}

/**
 * An RDF entity in a VoID file, in JSON-LD format
 * @author Thomas Minier
 */
export interface VoIDEntity extends URI {
  "@type": string[],
}

/**
 * A RDF Dataset in a VoID file, in JSON-LD format
 * @author Thomas Minier
 */
export interface VoIDDataset extends VoIDEntity {
  "http://purl.org/dc/terms/maintainer": Literal[],
  "http://purl.org/dc/terms/title": Literal[],
  "http://www.w3.org/ns/sparql-service-description#availableGraphs": URI[],
  "http://xmlns.com/foaf/0.1/homepage":  URI[]
}

/**
 * A Collection of RDF Graphs in a VoID file, in JSON-LD format
 * @author Thomas Minier
 */
export interface VoIDGraphList extends VoIDEntity {
  "http://www.w3.org/ns/sparql-service-description#namedGraph": URI[]
}

/**
 * An intermediary node in the SPARQL service description language
 * @author Thomas Minier
 */
export interface VoIDGraphNode extends VoIDEntity {
  "http://www.w3.org/ns/sparql-service-description#name": URI[],
  "http://www.w3.org/ns/sparql-service-description#graph": URI[],
}

/**
 * A RDF Graph in a VoID file, in JSON-LD format
 * @author Thomas Minier
 */
export interface VoIDGraph extends VoIDEntity {
  "http://purl.org/dc/terms/description": Literal[],
  "http://purl.org/dc/terms/title": Literal[],
  "http://rdfs.org/ns/void#distinctObjects": Literal[],
  "http://rdfs.org/ns/void#distinctSubjects": Literal[],
  "http://rdfs.org/ns/void#feature": Literal[],
  "http://rdfs.org/ns/void#properties": Literal[],
  "http://rdfs.org/ns/void#triples": Literal[],
  "http://sage.univ-nantes.fr/sage-voc#hasExampleQuery"?: URI[],
  "http://sage.univ-nantes.fr/sage-voc#quota": Literal[],
  "http://www.w3.org/ns/hydra/core#entrypoint": URI[],
  "http://www.w3.org/ns/hydra/core#itemsPerPage": Literal[],
  "http://www.w3.org/ns/sparql-service-description#endpoint": URI[],
  "http://xmlns.com/foaf/0.1/homepage": URI[]
}

export interface VoIDPresetQuery extends VoIDEntity {
  'http://www.w3.org/ns/hydra/core#entrypoint': URI[],
  'http://purl.org/dc/terms/title': Literal[],
  'http://www.w3.org/2000/01/rdf-schema#label': Literal[],
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#value': Literal[]
}

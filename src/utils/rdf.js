/* file : rdf.js
MIT License

Copyright (c) 2018 Thomas Minier

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

function namespace (prefix) {
  return function (value) {
    return `${prefix}${value}`
  }
}

const DCTERMS = namespace('http://purl.org/dc/terms/')
const HYDRA = namespace('http://www.w3.org/ns/hydra/core#')
const RDF = namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#')
const RDFS = namespace('http://www.w3.org/2000/01/rdf-schema#')
const SAGE = namespace('http://sage.univ-nantes.fr/sage-voc#')
const SD = namespace('http://www.w3.org/ns/sparql-service-description#')
const VOID = namespace('http://rdfs.org/ns/void#')

module.exports = {
  namespace,
  DCTERMS,
  HYDRA,
  RDF,
  RDFS,
  SAGE,
  SD,
  VOID
}

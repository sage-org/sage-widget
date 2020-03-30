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

import Dataset from './dataset'
import { VoIDEntity } from './void-entities'

/**
 * A Factory used to build RDF Datasets from VoID files
 * @author Thomas Minier
 */
export default interface DatasetFactory {
  /**
   * Build a RDF Dataset by dereferencing a VoID file
   * @param url - URL of the VoID file
   * @return A RDF Dataset built from the input VoID file
   */
  fromURI (url: string): Promise<Dataset>

  /**
   * Build a RDF Dataset from the content of a VoID file
   * @param entityURI - URI of the RDF dataset in the VoID file
   * @param entities - Content of the VoID file
   * @return A RDF Dataset built from the input VoID file
   */
  fromVoID (entityURI: string, entities: Map<string, VoIDEntity>): Dataset
}

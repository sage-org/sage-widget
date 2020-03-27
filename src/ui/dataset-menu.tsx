/* file: dataset-menu.tsx
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

import React from 'react'
import Dataset from '../void/dataset'
import QueryConfiguration from '../sparql/query-config'

import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'

interface DatasetMenuProps {
  dataset: Dataset | null,
  queryConfig: QueryConfiguration
}

/**
* The menu used to select a RDF Graph in the dataset
* @author Thomas Minier
*/
export default class DatasetMenu extends React.Component<DatasetMenuProps, {}> {

  /**
   * Method called when the form is updated, i.e., a default RDF graph has been selected
   * @param event 
   */
  onGraphSelection (event: React.FormEvent<HTMLInputElement>) {
    const url = event.currentTarget.value
    if (url !== "") {
      this.props.queryConfig.defaultGraph = event.currentTarget.value
    }
  }

  render () {
    return (
      <InputGroup className="mb-3">
        <InputGroup.Prepend>
          <InputGroup.Text><strong>Select a RDF Graph:</strong></InputGroup.Text>
        </InputGroup.Prepend>
        <FormControl id="serverInput" as="select" onChange={this.onGraphSelection.bind(this)}>
          <option value=""></option>
          {this.props.dataset?.graphs.map(graph => {
            return (<option value={graph.url} key={graph.getID()}>{graph.name}</option>)
          })}
        </FormControl>
      </InputGroup>
    )
  }
} 

/* file: query-menu.tsx
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
import PresetQuery from '../void/preset-query'
import QueryConfiguration from '../sparql/query-config'

import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'

interface QueryMenyProps {
  dataset: Dataset | null,
  queryConfig: QueryConfiguration
}

interface QueryMenuState {
  showModal: boolean,
  selectedPresetQuery: PresetQuery | null
}

export default class QueryMenu extends React.Component<QueryMenyProps, QueryMenuState> {
  constructor (props: QueryMenyProps) {
    super(props)
    this.state = {
      showModal: false,
      selectedPresetQuery: null
    }
  }

  showModal () {
    this.setState({ showModal: true })
  }

  hideModal () {
    this.setState({ showModal: false })
  }



  render () {
    return (
      <div>
        {/* Modal used to show queries */}
        <Modal show={this.state.showModal} onHide={this.hideModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Select a preset SPARQL query</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            
          </Modal.Body>
        </Modal>
        {/* Query selection menu */}
        <InputGroup className="mb-3">
          <InputGroup.Prepend>
            <InputGroup.Text>
              <Button onClick={this.showModal.bind(this)}>
                <strong>Select a preset SPARQL query:</strong>
              </Button>
            </InputGroup.Text>
          </InputGroup.Prepend>
          <FormControl id="queryName">
            {/* <FormControl disabled placeholder={this.state.selectedPresetQuery?.query} /> */}
          </FormControl>
        </InputGroup>
      </div>
    )
  }
}

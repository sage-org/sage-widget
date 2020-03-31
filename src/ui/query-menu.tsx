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

import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import FormControl from 'react-bootstrap/FormControl'
import InputGroup from 'react-bootstrap/InputGroup'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

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

  selectQuery(query: PresetQuery) {
    this.setState({ selectedPresetQuery: query })
    this.props.queryConfig.sparqlQuery = query.query
  }

  render () {
    return (
      <div>
        {/* Modal used to show queries */}
        <Modal size="lg" show={this.state.showModal} onHide={this.hideModal.bind(this)}>
          <Modal.Header closeButton>
            <Modal.Title>Select a preset SPARQL query</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Tabs variant="pills" justify id="queryPerGraph">
              {this.props.dataset?.graphs
                .filter(graph => graph.presetQueries.length > 0)
                .sort()
                .map(graph => (
                  <Tab eventKey={`${graph.getID()}Tab`} title={graph.name} key={graph.getID()}>
                    {graph.presetQueries.sort().map(query => (
                      <Accordion>
                        <Row>
                          <Col md="8">
                            <p key={query.getID()}>
                              <strong>{query.name}</strong>
                            </p>
                          </Col>
                          <Col md="4">
                            <Accordion.Toggle as={Button} eventKey={`showQuery${query.getID()}`}>
                              Show query
                            </Accordion.Toggle>
                            <em> </em>
                            <Button variant="success" onClick={() => this.selectQuery(query)}>
                              Use
                            </Button>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Accordion.Collapse eventKey={`showQuery${query.getID()}`}>
                              <pre><code>{query.query}</code></pre>
                            </Accordion.Collapse>
                          </Col>
                        </Row>
                      </Accordion>
                    ))}
                  </Tab>
              ))}
            </Tabs>
          </Modal.Body>
        </Modal>
        {/* Query selection menu */}
        <Row>
          <Col md="4">
            <Button onClick={this.showModal.bind(this)}>
              <strong>Select a preset query:</strong>
            </Button>
          </Col>
          <Col md="8">
            {this.state.selectedPresetQuery !== null && (
              <p>{this.state.selectedPresetQuery.name}</p>
            )}
          </Col>
        </Row>
      </div>
    )
  }
}

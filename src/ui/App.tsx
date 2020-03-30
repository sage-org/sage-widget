/* file: App.tsx
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
import JsonLDDatasetFactory from '../void/jsonld-dataset-factory'
import BindingsRepository from '../sparql/bindings-repo'
import QueryConfiguration from '../sparql/query-config'

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

import DatasetMenu from './dataset-menu'
import QueryMenu from './query-menu'
import ResultsTable from './results-table'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'

interface AppProps {
  url: string
}

interface AppState {
  dataset: Dataset | null,
  repository: BindingsRepository,
  queryConfig: QueryConfiguration
}

const UPDATE_THRESHOLD = 15

export default class App extends React.Component<AppProps, AppState> {
  constructor (props: AppProps) {
    super(props)
    this.state = {
      dataset: null,
      repository: new BindingsRepository(),
      queryConfig: new QueryConfiguration()
    }
  }

  componentDidMount () {
    // initialize the RDF dataset form the VoID URL
    const factory = new JsonLDDatasetFactory()
    factory.fromURI(this.props.url)
      .then(dataset => this.setState({ dataset }))
  }

  render () {
    return (
      <Container className="SparqlEditor" fluid>
        <Row>
          <Col>
            <Form>
              <DatasetMenu dataset={this.state.dataset} queryConfig={this.state.queryConfig}></DatasetMenu>
              <QueryMenu dataset={this.state.dataset} queryConfig={this.state.queryConfig}></QueryMenu>
              <Tabs id="query-menu">
                <Tab eventKey="sparqlMode" title="SPARQL">
                  <p><strong>Write your own SPARQL query!</strong></p>
                </Tab>
                <Tab eventKey="graphqlMode" title="GraphQL">
                  GraphQL
                </Tab>
              </Tabs>
            </Form>
          </Col>
          <Col>
            <ResultsTable repository={this.state.repository} updateThreshold={UPDATE_THRESHOLD}></ResultsTable>
          </Col>
        </Row>
      </Container>
    );
  }
}

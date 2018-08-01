import React, { Component } from 'react'
import SparqlIterator from 'sage-client/src/sparql-iterator.js'
import Spy from 'sage-client/src/engine/spy.js'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const BUCKET_SIZE = 20
const REACT_TABLE_PAGE_SIZE = 10

/**
 * Execute SPARQL queries suing a Sage client and display results in a paginated table
 * @extends Component
 * @author Thomas Minier
 */
class QueryExecutor extends Component {
  constructor (props) {
    super(props)
    this.currentIterator = null
    this.state = {
      results: [],
      columns: [],
      executionTime: 0,
      httpCalls: 0,
      errorMessage: null,
      isRunning: false,
      showTable: false,
      hasError: false
    }
    this.execute = this.execute.bind(this)
    this.stopExecution = this.stopExecution.bind(this)
  }
  render () {
    return (
      <div className='QueryExecutor'>
        {this.state.hasError ? (
          <div className='alert alert-warning alert-dismissible fade show' role='alert'>
            <strong>Error</strong> {this.sate.errorMessage}
            <button type='button' className='close' data-dismiss='alert' aria-label='Close'>
              <span aria-hidden='true'>&times;</span>
            </button>
          </div>
        ) : (null)}
        <button className='btn btn-primary' onClick={this.execute}>Execute</button>
        {this.state.isRunning ? (
          <button className='btn btn-danger' onClick={this.stopExecution}>Stop</button>
        ) : (null)}
        {this.state.showTable ? (
          <div>
            <p>Execution time: {this.state.executionTime}s HTTP calls: {this.state.httpCalls} ({this.state.results.length} mappings)</p>
            <ReactTable
              className='-striped'
              data={this.state.results}
              columns={this.state.columns}
              defaultPageSize={REACT_TABLE_PAGE_SIZE}
              noDataText='No mappings found'
            />
          </div>
        ) : (null)}
      </div>
    )
  }

  resetState () {
    this.currentIterator = null
    this.setState({
      results: [],
      columns: [],
      executionTime: 0,
      httpCalls: 0,
      errorMessage: null,
      hasError: false
    })
  }

  stopExecution () {
    if (this.currentIterator != null) {
      this.currentIterator.close()
    }
    this.setState({
      isRunning: false
    })
  }

  execute () {
    this.stopExecution()
    this.resetState()
    let spy = new Spy()
    this.currentIterator = new SparqlIterator(this.props.query, {spy: spy}, this.props.url)
    this.setState({
      isRunning: true,
      showTable: true
    })
    let bucket = []
    let warmup = true
    let startTime = Date.now()
    this.currentIterator.on('error', err => {
      console.error(err)
      this.setState({
        errorMessage: err
      })
      this.setState({
        isRunning: false,
        hasError: true
      })
    })
    this.currentIterator.on('data', x => {
      const now = Date.now()
      // update clock
      this.setState({
        executionTime: (now - startTime) / 1000,
        httpCalls: spy.nbHTTPCalls
      })
      // store results and render them by batch
      bucket.push(x)
      if (warmup) {
        this.setState({
          columns: Object.keys(x).map(k => {
            return {
              Header: k,
              accessor: k
            }
          })
        })
        warmup = false
      }
      if (bucket.length >= BUCKET_SIZE) {
        this.setState({
          results: this.state.results.concat(bucket)
        })
        bucket = []
      }
    })
    this.currentIterator.on('end', () => {
      const now = Date.now()
      // update clock
      this.setState({
        executionTime: (now - startTime) / 1000,
        httpCalls: spy.nbHTTPCalls
      })
      this.setState({
        results: this.state.results.concat(bucket)
      })
      this.setState({
        isRunning: false
      })
    })
  }
}

export default QueryExecutor

import React, { Component } from 'react'
import SageClient from 'sage-client/src/client.js'
import Spy from 'sage-client/src/engine/spy.js'
import ReactTable from 'react-table'
import 'react-table/react-table.css'

const BUCKET_SIZE = 20

/**
 * Execute SPARQL queries suing a Sage client and display results in a paginated table
 * @extends Component
 * @author Thomas Minier
 */
class QueryExecutor extends Component {
  constructor (props) {
    super(props)
    this.client = new SageClient(this.props.url)
    this.currentIterator = null
    this.state = {
      results: [],
      columns: [],
      executionTime: 0,
      httpCalls: 0
    }
    this.isRunning = false
    this.showTable = false
    this.execute = this.execute.bind(this)
    this.stopExecution = this.stopExecution.bind(this)
  }
  render () {
    return (
      <div className='QueryExecutor'>
        <button onClick={this.execute}>Execute</button>
        {this.isRunning ? (<button onClick={this.stopExecution}>Stop</button>) : (null)}
        {this.showTable ? (
          <div>
            <p>Results {this.state.executionTime}s {this.state.httpCalls} HTTP calls ({this.state.results.length} mappings)</p>
            <ReactTable
              className='-striped'
              data={this.state.results}
              columns={this.state.columns}
              defaultPageSize={BUCKET_SIZE}
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
      httpCalls: 0
    })
  }

  stopExecution () {
    if (this.currentIterator != null) {
      this.currentIterator.close()
    }
    this.isRunning = false
  }

  execute () {
    this.stopExecution()
    this.resetState()
    let spy = new Spy()
    this.currentIterator = this.client.execute(this.props.query, spy)
    this.isRunning = true
    this.showTable = true
    let bucket = []
    let warmup = true
    let startTime = Date.now()
    this.currentIterator.on('data', x => {
      // update clock
      this.setState({
        executionTime: (Date.now() - startTime) / 1000,
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
      this.setState({
        results: this.state.results.concat(bucket)
      })
      this.isRunning = false
    })
  }
}

export default QueryExecutor

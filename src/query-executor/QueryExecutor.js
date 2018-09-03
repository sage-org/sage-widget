import React, { Component } from 'react'
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
      avgServerTime: 0,
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
        <div className='row'>
          <div className='col-md-12'>
            <button className='btn btn-primary' onClick={this.execute}>Execute</button>
            {this.state.isRunning ? (
              <span>{' '}<button className='btn btn-danger' onClick={this.stopExecution}>Stop</button></span>
            ) : (null)}
          </div>
        </div>
        {this.state.showTable ? (
          <div className='row'>
            <div className='col-md-12'>
              <h3><i className='fas fa-chart-bar'></i> Real-time Statistics</h3>
              <table className='table'>
                <thead>
                  <tr>
                    <th>Execution time</th>
                    <th>HTTP requests</th>
                    <th># results</th>
                    <th>Avg server response time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{this.state.executionTime} s</td>
                    <td>{this.state.httpCalls} requests</td>
                    <td>{this.state.results.length} solution mappings</td>
                    <td>{this.state.avgServerTime} ms</td>
                  </tr>
                </tbody>
              </table>
              <h3><i className='fas fa-list-ul'></i> Query results</h3>
              <ReactTable
                sortable={false}
                className='-striped'
                data={this.state.results}
                columns={this.state.columns}
                defaultPageSize={REACT_TABLE_PAGE_SIZE}
                noDataText='No mappings found'
              />
            </div>
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
      avgServerTime: 0,
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
    let spy = new sage.Spy()
    let client = new sage.SageClient(this.props.url, spy)
    this.currentIterator = client.execute(this.props.query)
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
        httpCalls: spy.nbHTTPCalls,
        avgServerTime: spy.avgResponseTime
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
        httpCalls: spy.nbHTTPCalls,
        avgServerTime: spy.avgResponseTime
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

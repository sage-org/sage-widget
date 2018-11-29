/* file : QueryExecutor.js
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
    this.currentClient = null
    this.currentIterator = null
    this.subscription = null
    this.listener = x => {
      if ('toObject' in x) {
        x = x.toObject()
      }
      const now = Date.now()
      // update clock
      this.setState({
        executionTime: (now - this.startTime) / 1000,
        httpCalls: this.spy.nbHTTPCalls,
        avgServerTime: this.spy.avgResponseTime,
        history: this.state.history.concat([{
          x: (now - this.startTime) / 1000,
          y: this.spy.avgResponseTime
        }])
      })
      // store results and render them by batch
      this.bucket.push(x)
      if (this.warmup) {
        this.setState({
          columns: Object.keys(x).map(k => {
            return {
              Header: k,
              accessor: k,
              // render URIs as external links
              Cell: row => {
                if (row.value.startsWith('http')) {
                  return (<span>{'<'}<a href={row.value} target='_blank'>{row.value}</a>{'>'}</span>)
                } else if (row.value.includes('^^<http')) {
                  const index = row.value.lastIndexOf('^^<http')
                  const value = row.value.substring(0, index + 3)
                  const datatype = row.value.substring(index + 3, row.value.length - 1)
                  return (<span>{value}<a href={datatype} target='_blank'>{datatype}</a>></span>)
                } else if (row.value.includes('^^http')) {
                  const index = row.value.lastIndexOf('^^http')
                  const value = row.value.substring(0, index + 2)
                  const datatype = row.value.substring(index + 2, row.value.length)
                  return (<span>{value}{'<'}<a href={datatype} target='_blank'>{datatype}</a>{'>'}</span>)
                } else if (row.value === 'UNBOUND') {
                  return (<span className='badge badge-secondary'>unbound</span>)
                }
                return (<span>{row.value}</span>)
              }
            }
          })
        })
        this.warmup = false
      }
      if (this.bucket.length >= BUCKET_SIZE) {
        this.setState({
          results: this.state.results.concat(this.bucket)
        })
        this.bucket = []
      }
    }
    this.state = {
      results: [],
      columns: [],
      history: [],
      executionTime: 0,
      httpCalls: 0,
      avgServerTime: 0,
      errorMessage: null,
      isRunning: false,
      showTable: false,
      hasError: false,
      pauseText: 'Pause'
    }
    this.execute = this.execute.bind(this)
    this.stopExecution = this.stopExecution.bind(this)
    this.pauseExecution = this.pauseExecution.bind(this)
  }

  render () {
    return (
      <div className='QueryExecutor'>
        <div className='row'>
          <div className='col-md-12'>
            {this.state.isRunning ? (
              <div>
                <button className='btn btn-warning' onClick={this.pauseExecution}><i class='fas fa-stop' /> {this.state.pauseText}</button>
                <span>{' '}<button className='btn btn-danger' onClick={this.stopExecution}><i class='fas fa-times-circle' /> Stop</button></span>
              </div>
            ) : (
              <button className='btn btn-primary' onClick={this.execute}><i class='fas fa-play' /> Execute</button>
            )}
            {this.state.hasError ? (
              <div className='alert alert-danger alert-dismissible fade show' role='alert'>
                <strong>Error:</strong> {this.state.errorMessage}
                <button type='button' className='close' data-dismiss='alert' aria-label='Close'>
                  <span aria-hidden='true'>&times;</span>
                </button>
              </div>
            ) : (null)}
          </div>
        </div>
        {this.state.showTable ? (
          <div>
            <div className='row'>
              <div className='col-md-12'>
                <h3><i className='fas fa-chart-bar' /> Real-time Statistics</h3>
                <table className='table'>
                  <thead>
                    <tr>
                      <th><i class='fas fa-stopwatch' /> Execution time</th>
                      <th><i class='fas fa-download' /> HTTP requests</th>
                      <th><i class='fas fa-list-ol' /> Number of results</th>
                      <th><i class='fas fa-chart-line' /> Avg. HTTP response time</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{this.state.executionTime} s</td>
                      <td>{this.state.httpCalls} requests</td>
                      <td>{this.state.results.length} solution mappings</td>
                      <td>{Math.floor(this.state.avgServerTime)} ms</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className='row'>
              <div className='col-md-12'>
                <h3><i className='fas fa-list-ul' /> Query results</h3>
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
      history: [],
      executionTime: 0,
      avgServerTime: 0,
      httpCalls: 0,
      errorMessage: '',
      hasError: false,
      pauseText: 'Pause'
    })
  }

  stopExecution () {
    if (this.currentIterator != null) {
      this.subscription.unsubscribe()
      this.currentClient._graph.close()
    }
    this.setState({
      isRunning: false
    })
  }

  pauseExecution () {
    if (this.state.pauseText === 'Pause') {
      this.subscription.unsubscribe()
      this.currentClient._graph.close()
      this.setState({
        pauseText: 'Resume'
      })
    } else {
      this._subscribe()
      this.setState({
        pauseText: 'Pause'
      })
    }
  }

  _subscribe () {
    if (this.currentIterator !== null) {
      this.currentClient._graph.open()
      this.subscription = this.currentIterator.subscribe(this.listener, err => {
        console.error(err)
        this.setState({
          errorMessage: err.message,
          isRunning: false,
          hasError: true
        })
      }, () => {
        const now = Date.now()
        // update clock
        this.setState({
          executionTime: (now - this.startTime) / 1000
        })
        this.setState({
          results: this.state.results.concat(this.bucket)
        })
        this.setState({
          isRunning: false
        })
      })
    }
  }

  execute () {
    try {
      this.stopExecution()
      this.resetState()
      this.spy = new sage.Spy()
      this.currentClient = new sage.SageClient(this.props.url, this.spy)
      this._stubRequestClient(this.currentClient)
      this.currentIterator = this.currentClient.execute(this.props.query)
      this.setState({
        isRunning: true,
        showTable: true
      })
      this.bucket = []
      this.warmup = true
      this.startTime = Date.now()
      this._subscribe()
    } catch (e) {
      this.setState({
        errorMessage: e.message,
        isRunning: false,
        hasError: true
      })
    }
  }

  /**
   * Stub the HTTP client to measure HTTP requests
   */
  _stubRequestClient (sageClient) {
    const sendRequest = sageClient._graph._httpClient._httpClient.post
    sageClient._graph._httpClient._httpClient.post = (params, cb) => {
      sendRequest(params, (err, res, body) => {
        const now = Date.now()
        this.setState({
          executionTime: (now - this.startTime) / 1000,
          httpCalls: this.spy.nbHTTPCalls,
          avgServerTime: this.spy.avgResponseTime
        })
        cb(err, res, body)
      })
    }
  }
}

export default QueryExecutor

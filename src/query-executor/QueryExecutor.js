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
import protobuf from 'protobufjs'

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
    this.queueChart = null;
    this.listener = x => {
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
                if (row.value !== null && row.value.startsWith('http')) {
                  return (<a href={row.value} target='_blank'>{row.value}</a>)
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
      var answerCount = this.bucket.length + this.state.results.length;
      this.answerGraph.push([((now-this.startTime)/1000),answerCount]);
      var dief = this.evalDiefficiency();
      this.setState({
        diefficiency: dief
      })
    }
    this.state = {
      results: [],
      columns: [],
      history: [],
      executionTime: 0,
      httpCalls: 0,
      avgServerTime: 0,
      diefficiency: 0,
      errorMessage: null,
      isRunning: false,
      showTable: false,
      hasError: false,
      pauseText: 'Pause'
    }
    this.answerGraph = [[0,0]];
    this.execute = this.execute.bind(this)
    this.stopExecution = this.stopExecution.bind(this)
    this.pauseExecution = this.pauseExecution.bind(this)
  }

  render () {
    return (
      <div className='QueryExecutor'>
      <script src="node_modules/chart.js/dist/Chart.bundle.js"></script>
        <div className='row'>
          <div className='col-md-12'>
            {this.state.isRunning ? (
              <div>
                <button className='btn btn-warning' onClick={this.pauseExecution}>{this.state.pauseText}</button>
                <span>{' '}<button className='btn btn-danger' onClick={this.stopExecution}>Stop</button></span>
              </div>
            ) : (
              <button className='btn btn-primary' onClick={this.execute}>Execute</button>
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
                <br/>
                <h3><i className='fas fa-chart-bar' /> Real-time Statistics</h3>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Execution time</th>
                      <th>HTTP requests</th>
                      <th>Number of results</th>
                      <th>Avg. HTTP response time</th>
                      <th>Server Diefficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{this.state.executionTime} s</td>
                      <td>{this.state.httpCalls} requests</td>
                      <td>{this.state.results.length} solution mappings</td>
                      <td>{Math.floor(this.state.avgServerTime)} ms</td>
                      <td>{this.state.diefficiency}</td>
                    </tr>
                  </tbody>
                </table>
                <button className='btn btn-warning' data-toggle="collapse" data-target="#logs">Open execution logs</button>
                <br/>
                <div id="logs" class="collapse">
                  <br/>
                  <pre>
                  {this.state.execLogs}
                  </pre>
                </div>
                <br/>
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
      diefficiency: 0,
      execLogs: "No response yet",
      errorMessage: '',
      hasError: false,
      pauseText: 'Pause'
    })
    this.answerGraph = [[0,0]];
  }

  stopExecution () {
    if (this.currentIterator != null) {
      this.currentIterator.close()
    }
    this.setState({
      isRunning: false
    })
  }

  pauseExecution () {
    if (this.state.pauseText === 'Pause') {
      this.currentIterator.removeListener('data', this.listener)
      this.setState({
        pauseText: 'Resume'
      })
    } else {
      this._readIterator()
      this.setState({
        pauseText: 'Pause'
      })
    }
  }

  _readIterator () {
    if (this.currentIterator !== null) {
      this.currentIterator.on('data', this.listener)
    }
  }

  evalDiefficiency (){
    var dief = this.state.diefficiency;
    var i = this.answerGraph.length - 1;
    var prevX = this.answerGraph[i-1][0];
    var prevY = this.answerGraph[i-1][1];
    var currX = this.answerGraph[i][0];
    var currY = this.answerGraph[i][1];
    var area = ((currX-prevX) * prevY) + (((currX-prevX) * (currY - prevY))/2);
    return Math.round((dief + area) * 100) / 100 ;
  }

  execute () {
    try {
      this.stopExecution()
      this.resetState()
      this.spy = new sage.Spy()
      let client = new sage.SageClient(this.props.url, this.spy)
      this._stubRequestClient(client)
      this.currentIterator = client.execute(this.props.query)
      this.setState({
        isRunning: true,
        showTable: true,
      })
      this.bucket = []
      this.warmup = true
      this.startTime = Date.now()
      this.currentIterator.on('error', err => {
        console.error(err)
        this.setState({
          errorMessage: err.message,
          isRunning: false,
          hasError: true
        })
      })

      this.currentIterator.on('end', () => {
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
        this.answerGraph.push([((now-this.startTime)/1000),this.state.results.length]);
        var dief = this.evalDiefficiency();
        this.setState({
          diefficiency: dief
        })

      })
      this._readIterator()
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
        var next = body.next;
        this.setState({
          executionTime: (now - this.startTime) / 1000,
          httpCalls: this.spy.nbHTTPCalls,
          avgServerTime: this.spy.avgResponseTime
        })
        if (next != null) {
          var jsonDescriptor = require("../protobuf/iterators.json"); // exemplary for node
          var root = protobuf.Root.fromJSON(jsonDescriptor);
          var iterators = root.lookup("iterators");
          var nsr=iterators.RootTree.decode(Buffer.from(next,'base64'));
          var treeText = JSON.stringify(nsr, null, 2);
          this.setState({
            execLogs: treeText
          })
        }

        cb(err, res, body)
      })
    }
  }
}

export default QueryExecutor

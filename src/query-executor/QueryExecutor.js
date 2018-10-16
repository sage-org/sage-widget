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
import ReactDOM from 'react-dom'
import ReactTable from 'react-table'
import Chart from 'chart.js';
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
    this.queueChart = null;
    this.listener = x => {
      const now = Date.now()
      if (this.state.readyToRender) {
        this.state.readyToRender = false;
        var wrapper = ReactDOM.findDOMNode(this.refs.chartWrapper);
        var canvas = ReactDOM.findDOMNode(this.refs.queueChart);
        var ctx = canvas.getContext("2d");
        this.queueChart = new Chart(ctx,{
              type: "line",
              beginAtZero: true,
              data: this.state.data,
              options: this.state.options
          });
      }
      var nbQueue = Math.floor((this.spy._responseTimes[this.spy._responseTimes.length-1]-75)/75)
      if (nbQueue < 0) {
        nbQueue = 0;
      }
      // update clock
      this.setState({
        executionTime: (now - this.startTime) / 1000,
        queue: nbQueue,
        httpCalls: this.spy.nbHTTPCalls,
        avgServerTime: this.spy.avgResponseTime,
        history: this.state.history.concat([{
          x: (now - this.startTime) / 1000,
          y: this.spy.avgResponseTime
        }])
      })
      var lastUpdate = this.state.data.labels[this.state.data.labels.length-1];
      if (lastUpdate == null || lastUpdate != this.spy._nbHttpCalls) {
        this.state.data.labels.push(this.spy._nbHttpCalls);
        this.state.data.datasets[0].data.push(nbQueue);
        this.queueChart.update();
      }
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
    }
    this.state = {
      results: [],
      columns: [],
      history: [],
      executionTime: 0,
      httpCalls: 0,
      avgServerTime: 0,
      readyToRender: false,
      queue: 0,
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
              <div className='col-md-12' ref={this.canvasRef}>
                <h3><i className='fas fa-chart-bar' /> Real-time Statistics</h3>
                <table className='table'>
                  <thead>
                    <tr>
                      <th>Execution time</th>
                      <th>HTTP requests</th>
                      <th>Number of results</th>
                      <th>Avg. HTTP response time</th>
                      <th>Estimated server queue</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{this.state.executionTime} s</td>
                      <td>{this.state.httpCalls} requests</td>
                      <td>{this.state.results.length} solution mappings</td>
                      <td>{Math.floor(this.state.avgServerTime)} ms</td>
                      <td>{this.state.queue} clients</td>
                    </tr>
                  </tbody>
                </table>
                <div className="chartWrapper" ref="chartWrapper">
                  <canvas id="queueChart" ref="queueChart" width="100%" height="35%"></canvas>
                </div>
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
      data: {
        labels: [],
        datasets: [
          {
            label: "Estimated number of clients in queue",
            backgroundColor: "rgba(63,127,191,0.2)",
            pointBackgroundColor: "rgba(63,127,191,1)",
            borderColor: "rgba(63,127,191,0.6)",
            pointHoverBackgroundColor: "rgba(63,127,191,1)",
            pointHoverBorderColor: "rgba(63,127,191,1)",
            data: []
          }
        ]
      },
      options: {

        ///Boolean - Whether grid lines are shown across the chart
        scaleShowGridLines : true,

        //String - Colour of the grid lines
        scaleGridLineColor : "rgba(0,0,0,.05)",

        //Number - Width of the grid lines
        scaleGridLineWidth : 1,

        //Boolean - Whether to show horizontal lines (except X axis)
        scaleShowHorizontalLines: true,

        //Boolean - Whether to show vertical lines (except Y axis)
        scaleShowVerticalLines: true,

        //Boolean - Whether the line is curved between points
        bezierCurve : true,

        //Number - Tension of the bezier curve between points
        bezierCurveTension : 0.4,

        //Boolean - Whether to show a dot for each point
        pointDot : true,

        //Number - Radius of each point dot in pixels
        pointDotRadius : 4,

        //Number - Pixel width of point dot stroke
        pointDotStrokeWidth : 1,

        //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
        pointHitDetectionRadius : 20,

        //Boolean - Whether to show a stroke for datasets
        datasetStroke : true,

        //Number - Pixel width of dataset stroke
        datasetStrokeWidth : 2,

        //Boolean - Whether to fill the dataset with a colour
        datasetFill : true,

        //Boolean - Whether to horizontally center the label and point dot inside the grid
        offsetGridLines : false,

        scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 10,
                        suggestedMax: 200
                    }
                }]
            }
      },
      readyToRender: false,
      queue: 0,
      errorMessage: '',
      hasError: false,
      pauseText: 'Pause'
    })
    if (this.queueChart != null) {
      this.queueChart.destroy();
    }
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
        readyToRender: true
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

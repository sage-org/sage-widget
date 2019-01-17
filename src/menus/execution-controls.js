/* file : execution-controls.js
MIT License

Copyright (c) 2019 Thomas Minier

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

import m from 'mithril'
import GraphqlCompiler from '../graphql/compiler'

const MAX_BUCKET_SIZE = 10

/**
 * Stub the HTTP client to measure HTTP requests
 */
function _stubRequestClient (sageClient, spy, state) {
  const sendRequest = sageClient._graph._httpClient._httpClient.post
  sageClient._graph._httpClient._httpClient.post = (params, cb) => {
    sendRequest(params, function (err, res, body) {
      const now = Date.now()
      state.executionTime = (now - state.startTime) / 1000
      state.httpCalls = spy.nbHTTPCalls
      state.avgServerTime = spy.avgResponseTime
      cb(err, res, body)
    })
  }
}

const graphqlCompiler = new GraphqlCompiler()

// Control SPARQL query execution
export default function ExecutionControls (state) {
  function executeQuery () {
    // In GraphQL mode: first compile the GraphQL query into SPARQL
    if (state.graphqlMode) {
      // TODO check if the GraphQL query and context are well formed
      const context = JSON.parse(state.graphqlContext)
      state.currentQueryValue = graphqlCompiler.compile(state.graphqlQuery, context['@context'])
    }
    if (state.currentQueryValue !== null) {
      // reset results array & page number
      state.results = []
      state.pageNum = 0
      state.executionTime = 0
      // bucket used to buffer results
      let bucket = []
      state.spy = new sage.Spy()
      state.currentClient = new sage.SageClient(state.currentDataset, state.spy)
      _stubRequestClient(state.currentClient, state.spy, state)
      state.currentIterator = state.currentClient.execute(state.currentQueryValue)
      state.isRunning = true
      // open HTTP client & set starting time
      state.currentClient._graph.open()
      state.startTime = Date.now()
      // start query processing
      state.subscription = state.currentIterator.subscribe(function (b) {
        if (state.isRunning) {
          if ('toObject' in b) {
            b = b.toObject()
          }
          bucket.push(b)
          if (bucket.length >= MAX_BUCKET_SIZE) {
            bucket.forEach(v => {
              state.results.push(v)
            })
            bucket = []
            m.redraw()
          }
        }
      }, console.error, function () {
        // update stats after completion
        const now = Date.now()
        state.executionTime = (now - state.startTime) / 1000
        state.httpCalls = state.spy.nbHTTPCalls
        state.avgServerTime = state.spy.avgResponseTime
        // cleanup
        state.isRunning = false
        state.subscription = null
        // push last results
        if (bucket.length > 0) {
          bucket.forEach(v => {
            state.results.push(v)
          })
        }
        m.redraw()
      })
    }
  }

  function pauseQuery () {
    console.log('pause')
  }

  function stopQuery () {
    state.isRunning = false
    if (state.subscription !== null) {
      state.subscription.unsubscribe()
      state.currentClient._graph.close()
    }
  }

  return {
    view: function () {
      return m('div', {class: 'QueryExecutor'}, [
        m('div', {class: 'row'}, [
          m('div', {class: 'col-md-12'}, [
            (state.isRunning) ? m('span', [
              m('button', {
                class: 'btn btn-warning',
                onclick: pauseQuery
              }, [
                m('i', {class: 'fas fa-stop'}),
                ' Pause'
              ]),
              ' ',
              m('button', {
                class: 'btn btn-danger',
                onclick: stopQuery
              }, [
                m('i', {class: 'fas fa-times-circle'}),
                ' Stop'
              ])
            ]) : m('button', {
              class: 'btn btn-success',
              onclick: executeQuery
            }, [
              m('i', {class: 'fas fa-play'}),
              ' Execute'
            ])
          ])
        ])
      ])
    }
  }
}

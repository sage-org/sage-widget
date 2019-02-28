/* file : sage-widget.js
MIT License

Copyright (c) 2019 Thomas Minier

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

'use strict'

import m from 'mithril'
import DatasetMenu from './menus/dataset-menu.js'
import QueryMenu from './menus/query-menu.js'
import ExecutionControls from './menus/execution-controls'
import GraphQLBoard from './menus/graphql-board'
import ExecutionStats from './execution/execution-stats.js'
import ResultsTable from './execution/results-table.js'
import { fetchVoID } from './utils/void.js'
import YASQE from 'yasgui-yasqe'
import 'yasgui-yasqe/dist/yasqe.min.css'

/**
* A SPARQL/GraphQL widget for querying SaGe servers
* @author Thomas Minier
*/
export default function SageWidget (url, defaultServer, defaultQuery, defaultQName) {
  const data = {
    datasets: [],
    currentDataset: defaultServer,
    queries: [],
    results: [],
    currentQueryValue: defaultQuery,
    currentQueryName: defaultQName,
    isRunning: false,
    isPaused: false,
    graphqlMode: false,
    graphqlQuery: 'query {\n  label\n}',
    graphqlContext: '{\n  "@context": {\n    "label": "http://www.w3.org/2000/01/rdf-schema#label"\n  }\n}',
    pageNum: 0,
    // execution related variables
    pauseStatus: 'Pause',
    currentClient: null,
    currentIterator: null,
    subscription: null,
    spy: null,
    lastError: null,
    bucket: []
  }

  function switchMode (value) {
    return function () {
      data.graphqlMode = value
    }
  }
  return {
    oncreate: function () {
      // init widget using the server's VoID description
      fetchVoID(url)
        .then(voID => {
          data.datasets = voID.urls
          data.queries = voID.queries
          data.currentDataset = (defaultServer === null) ? voID.urls[0].url : defaultServer
          if (defaultQuery !== null && defaultQName !== null) {
            data.currentQueryValue = defaultQuery
            data.currentQueryName = defaultQName
            data.sparqlEditor.setValue(defaultQuery)
          } else {
            data.currentQueryValue = 'SELECT ?label WHERE {\n  ?s <http://www.w3.org/2000/01/rdf-schema#label> ?label\n}'
            data.sparqlEditor.setValue(data.currentQueryValue)
          }
          // then, check if the query was shared
          const url = new URL(document.location.href.replace('#query=', '?query='))
          if (url.searchParams.has('query') && url.searchParams.has('dataset')) {
            // load query & dataset
            data.currentQueryName = 'SPARQL query shared by link'
            data.currentQueryValue = url.searchParams.get('query')
            data.sparqlEditor.setValue(data.currentQueryValue)
            data.currentDataset = url.searchParams.get('dataset')
          }
          m.redraw()
        })
        .catch(console.error)
      // build YASQE query widget
      data.sparqlEditor = YASQE.fromTextArea(document.getElementById('yasqe-editor'), {
        createShareLink: function (editor) {
          const params = YASQE.createShareLink(editor)
          params['dataset'] = data.currentDataset
          return params
        }
      })
      // keep SPARQL query updated in component state
      data.sparqlEditor.on('change', args => {
        data.currentQueryValue = args.getQueryWithValues()
      })
      // handle weird refresh bug with YASQE + bootstrap tabs
      $('#sparqlTab').on('shown.bs.tab', function () {
        data.sparqlEditor.setValue(data.currentQueryValue)
      })
    },
    view: function () {
      return [
        m('div', { class: 'SparqlEditor' }, [
          m('form', [
            DatasetMenu(data),
            m('ul', {class: 'nav nav-tabs', id: 'modeTab', role: 'tablist'}, [
              m('li', {class: 'nav-item'}, m('a', {class: 'nav-link active', id: 'sparqlTab', 'data-toggle': 'tab', role: 'tab', href: '#sparqlMode', 'aria-controls': 'sparqlMode', 'aria-selected': true, onclick: switchMode(false)}, 'SPARQL')),
              m('li', {class: 'nav-item'}, m('a', {class: 'nav-link', id: 'graphqlTab', 'data-toggle': 'tab', role: 'tab', href: '#graphqlMode', 'aria-controls': 'graphqlMode', 'aria-selected': true, onclick: switchMode(true)}, 'GraphQL'))
            ]),
            m('div', {class: 'tab-content', id: 'queryModeTab'}, [
              m('div', {class: 'tab-pane fade show active', id: 'sparqlMode', role: 'tabpanel', 'aria-labelledby': 'sparqlTab'}, [
                QueryMenu(data),
                m('br'),
                m('strong', 'or write your own SPARQL query'),
                m('textarea', {id: 'yasqe-editor'})
              ]),
              m('div', {class: 'tab-pane fade', id: 'graphqlMode', role: 'tabpanel', 'aria-labelledby': 'graphqlTab'}, [
                m(GraphQLBoard(data))
              ])
            ])
          ]),
          m(ExecutionControls(data)),
          m(ExecutionStats(data)),
          m(ResultsTable(data))
        ])
      ]
    }
  }
}

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
import ExecutionStats from './execution/execution-stats.js'
import ResultsTable from './execution/results-table.js'
import { fetchVoID } from './utils/void.js'
import YASQE from 'yasgui-yasqe'
import 'yasgui-yasqe/dist/yasqe.min.css'
// import sortBy from 'lodash.sortby'

/**
* A SPARQL Query editor, built using YASQE
* @extends Component
* @author Thomas Minier
* @see http://yasqe.yasgui.org/
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
    pageNum: 0
  }
  return {
    oncreate: function () {
      // if the query was shared using YASQE, then a query is set in url#query=...
      const pageUrl = window.location.href
      if (pageUrl.includes('#query=')) {
        const index = pageUrl.indexOf('#query=')
        defaultQuery = decodeURIComponent(pageUrl.substring(index + 7).replace(/\+/gi, ' '))
      }
      // init widget using the server's VoID description
      fetchVoID(url)
        .then(voID => {
          data.datasets = voID.urls
          data.currentDataset = voID.urls[0].url
          data.queries = voID.queries
          m.redraw()
        })
        .catch(console.error)
        // build YASQE query widget
      data.yasqe = YASQE.fromTextArea(document.getElementById('yasqe-editor'))
      data.yasqe.setValue(defaultQuery)
      // keep SPARQL query updated in component state
      data.yasqe.on('change', args => {
        data.currentQueryValue = args.getQueryWithValues()
      })
    },
    view: function () {
      return [
        m('div', { class: 'SparqlEditor' }, [
          m('form', [
            DatasetMenu(data),
            QueryMenu(data),
            // data.currentQuery != null ? m('p', data.currentQuery.value) : null
            m('textarea', {id: 'yasqe-editor'})
          ]),
          m(ExecutionControls(data)),
          m(ExecutionStats(data)),
          m(ResultsTable(data))
        ])
      ]
    }
  }
}

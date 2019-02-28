/* file : execution-stats.js
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

/**
* Display query execution statistics
* @author Thomas Minier
*/
export default function ExecutionStats (state) {
  return {
    view: function () {
      return m('div', {class: 'ExecutionStats'}, [
        (state.executionTime > 0) ? m('div', {class: 'row'}, [
          m('div', {class: 'col-md-12'}, [
            m('h3', [
              m('i', {class: 'fas fa-chart-bar'}),
              ' Real-time Statistics'
            ]),
            m('table', {class: 'table'}, [
              m('thead', [
                m('tr', [
                  m('th', [ m('i', {class: 'far fa-clock'}), ' Execution time' ]),
                  m('th', [ m('i', {class: 'fas fa-sync'}), ' Progression' ]),
                  m('th', [ m('i', {class: 'fas fa-download'}), ' HTTP requests' ]),
                  m('th', [ m('i', {class: 'fas fa-list-ol'}), ' Number of results' ]),
                  m('th', [ m('i', {class: 'fas fa-chart-line'}), ' Avg. HTTP response time' ])
                ])
              ]),
              m('tbody', [
                m('tr', [
                  m('td', state.executionTime + ' s'),
                  m('td', state.progression + ' %'),
                  m('td', state.httpCalls + ' requests'),
                  m('td', state.results.length + ' solution mappings'),
                  m('td', Math.floor(state.avgServerTime) + ' ms')
                ])
              ])
            ])
          ])
        ]) : null
      ])
    }
  }
}

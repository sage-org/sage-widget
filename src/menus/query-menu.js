/* file : query-menu.js
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
import { FEATURES } from '../utils/features.js'

let filterQueryPredicate = function () { return true }

function switchActiveFilter (newActive) {
  $('.nav-queries.nav-link.active').removeClass('active')
  $(newActive).addClass('active')
}

function searchBy (feature) {
  return function (dataset, q) {
    return q.features.findIndex(feature) > -1
  }
}

/**
* Menu used to select a preset SPARQL query, loaded from a server VoID description
* @author Thomas Minier
*/
export default function DatasetMenu (state) {
  return m('div', [
    // modal
    m('div', {
      class: 'modal fade',
      id: 'presetQueryMenu',
      tabindex: '-1',
      role: 'dialog',
      'aria-labelledby': 'presetQueryMenuLabel',
      'aria-hidden': true
    }, [
      m('div', {class: 'modal-dialog', role: 'document'}, [
        m('div', {class: 'modal-content'}, [
          // header
          m('div', {class: 'modal-header'}, [
            m('button', {class: 'close', 'data-dismiss': 'modal', 'aria-label': 'close'}, m('i', {class: 'fas fa-times fa-xs'}))
          ]),
          // body
          m('div', {class: 'modal-body'}, [
            m('div', {class: 'container'}, [
              // filter by dataset name
              m('div', {class: 'row'}, [
                m('div', {class: 'col-md-12'}, [
                  // dataset names
                  m('h5', [m('i', {class: 'fas fa-search'}), ' Filter by RDF Dataset']),
                  m('ul', {class: 'nav nav-pills'}, [
                    m('li', {class: 'nav-item'}, [
                      m('a', {
                        href: '#',
                        class: 'nav-queries nav-link active',
                        onclick: function (e) {
                          e.preventDefault()
                          switchActiveFilter(this)
                          filterQueryPredicate = function () { return true }
                        }}, 'all')
                    ]),
                    state.queries.map(info => {
                      return m('li', {class: 'nav-item'}, m('a', {
                        href: '#',
                        class: 'nav-queries nav-link',
                        onclick: function (e) {
                          e.preventDefault()
                          switchActiveFilter(this)
                          filterQueryPredicate = function (dataset) {
                            return dataset === info.dataset
                          }
                        }
                      }, info.dataset))
                    })
                  ])
                ])
              ]),
              // filter by SPARQL feature
              m('div', {class: 'row'}, [
                m('div', {class: 'col-md-12'}, [
                  m('h5', [m('i', {class: 'fas fa-search'}), ' Filter by SPARQL features']),
                  m('ul', {class: 'nav nav-pills'}, [
                    m('li', {class: 'nav-item'}, [
                      // all
                      m('a', {
                        href: '#',
                        class: 'nav-queries nav-link active',
                        onclick: function (e) {
                          e.preventDefault()
                          switchActiveFilter(this)
                          filterQueryPredicate = function () { return true }
                        }}, 'all'),
                      // BGP
                      m('a', {
                        href: '#',
                        class: 'nav-queries nav-link active',
                        onclick: function (e) {
                          e.preventDefault()
                          switchActiveFilter(this)
                          filterQueryPredicate = searchBy(FEATURES.BGP)
                        }}, 'Basic Graph patterns')
                    ])
                  ])
                ])
              ]),
              // filtered SPARQL queries
              m('div', {class: 'row'}, [
                m('div', {class: 'col-md-12'}, [
                  m('div', [
                    m('h5', [m('i', {class: 'fas fa-list-ul'}), ' SPARQL queries']),
                    m('ul', {class: 'list-group'}, state.queries.map(info => {
                      return info.queries.map(q => {
                        if (!filterQueryPredicate(info.dataset, q)) {
                          return null
                        }
                        return m('li', {class: 'list-group-item'}, m('a', {
                          href: '#',
                          onclick: function (e) {
                            e.preventDefault()
                            // set target dataset
                            state.currentQueryName = q.name
                            // set query
                            state.currentDataset = q.url
                            state.currentQueryValue = q.value
                            state.sparqlEditor.setValue(q.value)
                            // close modal
                            $('#presetQueryMenu').modal('hide')
                          }
                        }, q.name))
                      })
                    }))
                  ])
                ])
              ])
            ])
          ])
        ])
      ])
    ]),
    // display query selection button + selected query
    m('div', {class: 'form-group'}, [
      m('label', {for: 'serverInput'}, [
        m('strong', 'Select a preset query')
      ]),
      m('div', {class: 'input-group'}, [
        m('div', {class: 'input-group-prepend'}, [
          // button to show modal
          m('button', {
            type: 'button',
            class: 'btn btn-primary',
            'data-toggle': 'modal',
            'data-target': '#presetQueryMenu'
          }, [
            m('i', {class: 'fas fa-eye'}),
            ' Show preset queries'
          ])
        ]),
        m('input', {
          class: 'form-control',
          disabled: true,
          id: 'serverInput',
          type: 'text',
          value: state.currentQueryName
        })
      ])
    ])
  ])
}

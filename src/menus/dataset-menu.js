/* file : dataset-selection-menu.js
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
* Menu used to select a RDF dataset
* @author Thomas Minier
*/
export default function DatasetMenu (state) {
  return m('div', {class: 'form-group'}, [
    m('label', {for: 'serverInput'}, [
      m('strong', 'Select a RDF dataset:')
    ]),
    m('div', {class: 'input-group'}, [
      m('div', {class: 'input-group-prepend'}, [
        m('div', {class: 'dropdown'}, [
          m('button', {
            id: 'dropdownMenuButton',
            class: 'btn btn-outline-secondary dropdown-toggle',
            type: 'button',
            'data-toggle': 'dropdown',
            'aria-haspopup': 'true',
            'aria-expanded': 'false'
          }, 'Available datasets'),
          m('div', {
            class: 'dropdown-menu scrollable-menu',
            'aria-labelledby': 'dropdownMenuButton'
          }, state.datasets.map(s => m('button', {
            class: 'dropdown-item',
            onclick: e => {
              e.preventDefault()
              state.currentDataset = s.url
            }
          }, s.name)))
        ])
      ]),
      m('input', {
        class: 'form-control',
        id: 'serverInput',
        type: 'text',
        value: state.currentDataset,
        onchange: function (e) {
          state.currentDataset = e.currentTarget.value
        }
      })
    ])
  ])
}

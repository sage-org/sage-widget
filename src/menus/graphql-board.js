/* file : graphql-board.js
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

export default function GraphQLBoard (state) {
  return {
    view: function () {
      return m('div', [
        m('form', [
          m('div', {class: 'form-group'}, [
            m('label', {for: 'graphqlInputQuery'}, m('strong', 'GraphQL query')),
            m('textarea', {
              class: 'form-control',
              id: 'graphqlInputQuery',
              placeholder: 'Write a GraphQL query',
              rows: 6,
              value: state.graphqlQuery,
              oninput: function (e) {
                state.graphqlQuery = e.target.value
              }})
          ]),
          m('div', {class: 'form-group'}, [
            m('label', {for: 'graphqlInputContext'}, [
              m('strong', 'JSON-LD context'),
              ' ',
              m('small', m('a', {href: 'https://gist.github.com/rubensworks/9d6eccce996317677d71944ed1087ea6', target: '_blank'}, 'Why do I need this?'))
            ]),
            m('textarea', {
              class: 'form-control',
              id: 'graphqlInputContext',
              placeholder: 'Write a JSON-LD context',
              rows: 6,
              value: state.graphqlContext,
              oninput: function (e) {
                state.graphqlContext = e.target.value
              }})
          ])
        ])
      ])
    }
  }
}

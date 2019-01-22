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
import CodeFlask from 'codeflask'

// GraphQL language definition for Prism
const PRISM_GRAPHQL_LANG = {
  comment: /#.*/,
  string: {
    pattern: /"(?:\\.|[^\\"\r\n])*"/,
    greedy: true
  },
  number: /(?:\B-|\b)\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/i,
  boolean: /\b(?:true|false)\b/,
  variable: /\$[a-z_]\w*/i,
  directive: {
    pattern: /@[a-z_]\w*/i,
    alias: 'function'
  },
  'attr-name': /[a-z_]\w*(?=\s*(?:\([^()]*\))?:)/i,
  keyword: [
    {
      pattern: /(fragment\s+(?!on)[a-z_]\w*\s+|\.{3}\s*)on\b/,
      lookbehind: true
    },
    /\b(?:query|fragment|mutation)\b/
  ],
  operator: /!|=|\.{3}/,
  punctuation: /[!(){}[]:=,]/
}

/**
* Menus used to input GraphQL queries
* @author Thomas Minier
*/
export default function GraphQLBoard (state) {
  return {
    oncreate: function () {
      // create GraphQL query editor
      const graphqlEditor = new CodeFlask('#graphqlInputQuery', {
        language: 'graphql',
        lineNumbers: true
      })
      graphqlEditor.addLanguage('graphql', PRISM_GRAPHQL_LANG)
      graphqlEditor.updateCode(state.graphqlQuery)
      graphqlEditor.onUpdate(code => {
        state.graphqlQuery = code
      })
      // create JSON-LD context editor
      const contextEditor = new CodeFlask('#graphqlInputContext', {
        language: 'js',
        lineNumbers: true
      })
      contextEditor.updateCode(state.graphqlContext)
      contextEditor.onUpdate(code => {
        state.graphqlContext = code
      })
    },
    view: function () {
      return m('div', [
        m('form', [
          m('div', {class: 'form-group'}, [
            m('label', {for: 'graphqlInputQuery'}, m('strong', 'GraphQL query')),
            m('div', {class: 'code-editor', id: 'graphqlInputQuery'})
          ]),
          m('div', {class: 'form-group'}, [
            m('label', {for: 'graphqlInputContext'}, [
              m('strong', 'JSON-LD context'),
              ' ',
              m('small', m('a', {href: 'https://gist.github.com/rubensworks/9d6eccce996317677d71944ed1087ea6', target: '_blank'}, 'Why do I need this?'))
            ]),
            m('div', {class: 'code-editor', id: 'graphqlInputContext'})
          ])
        ])
      ])
    }
  }
}

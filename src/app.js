/* file : app.js
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
import SageWidget from './sage-widget.js'
import { fetchVoID } from './utils/void.js'
import './app.css'

const root = document.getElementById('sage-widget')
const attr = root.attributes

if (attr.getNamedItem('urls') === null) {
  throw new Error('A Sage Widget must be initiliazed with an "urls" attribute')
} else {
  const urls = attr.getNamedItem('urls').value.split(',')
  const defaultServer = attr.getNamedItem('defaultServer') !== null ? attr.getNamedItem('defaultServer').value : null
  const defaultQuery = attr.getNamedItem('defaultQuery') !== null ? attr.getNamedItem('defaultQuery').value : null
  const defaultQName = attr.getNamedItem('defaultQName') !== null ? attr.getNamedItem('defaultQName').value : null

  Promise.all(urls.map(url => {
    return fetchVoID(url).then(content => {
      return {url, content}
    })
  }))
    .then(voIDContents => {
      m.mount(root, SageWidget(voIDContents, defaultServer, defaultQuery, defaultQName))
    })
}

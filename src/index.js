import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const root = document.getElementById('sage-widget')
const attr = root.attributes
const url = attr.getNamedItem('url').value
const defaultQuery = attr.getNamedItem('defaultQuery') !== null ? attr.getNamedItem('defaultQuery').value : ''
const defaultQName = attr.getNamedItem('defaultQName') !== null ? attr.getNamedItem('defaultQName').value : ''
ReactDOM.render(<App url={url} defaultQuery={defaultQuery} defaultQName={defaultQName} />, root)

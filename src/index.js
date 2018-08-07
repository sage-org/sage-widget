import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const root = document.getElementById('sage-widget')
const url = root.attributes.getNamedItem('url').value
ReactDOM.render(<App url={url} />, root)

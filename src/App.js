import React, { Component } from 'react'
import SparqlEditor from './sparql-editor/SparqlEditor.js'
import './App.css'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <SparqlEditor />
      </div>
    )
  }
}

export default App

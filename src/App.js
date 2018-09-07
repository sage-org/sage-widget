import React, { Component } from 'react'
import SparqlEditor from './sparql-editor/SparqlEditor.js'
import './App.css'

class App extends Component {
  render () {
    return (
      <div className='App'>
        <SparqlEditor
          url={this.props.url}
          defaultServer={this.props.defaultServer}
          defaultQuery={this.props.defaultQuery}
          defaultQName={this.props.defaultQName} />
      </div>
    )
  }
}

export default App

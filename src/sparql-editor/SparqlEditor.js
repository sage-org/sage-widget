import React, { Component } from 'react'
import QueryExecutor from '../query-executor/QueryExecutor.js'
import YASQE from 'yasgui-yasqe'
import 'yasgui-yasqe/dist/yasqe.min.css'
import './SparqlEditor.css'

/**
 * A SPARQL Query editor, built using YASQE
 * @extends Component
 * @author Thomas Minier
 * @see http://yasqe.yasgui.org/
 */
class SparqlEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      query: 'select * where { ?s ?p ?o }'
    }
  }
  render () {
    return (
      <div className='SparqlEditor'>
        <textarea id='yasqe-editor' />
        <QueryExecutor query={this.state.query} url='http://sage.univ-nantes.fr/sparql/dbpedia-2016-04' />
      </div>
    )
  }

  componentDidMount () {
    this.yasqe = YASQE.fromTextArea(document.getElementById('yasqe-editor'))
    this.yasqe.setValue(this.props.query || this.state.query)
    // keep SPARQL query updated in component state
    this.yasqe.on('change', args => {
      this.setState({
        query: args.getQueryWithValues()
      })
    })
  }

  componentDidUpdate () {
    this.yasqe.refresh()
  }
}

export default SparqlEditor

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
      query: 'select * where { ?s ?p ?o }',
      url: 'http://sage.univ-nantes.fr/sparql/dbpedia-2016-04'
    }

    this.updateUrl = this.updateUrl.bind(this)
  }
  render () {
    return (
      <div className='SparqlEditor'>
        <form>
          <div className='form-group'>
            <label for='serverInput'><strong>Server:</strong></label>
            <div className='input-group'>
              <div className='input-group-prepend'>
                <div className='dropdown'>
                  <button className='btn btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    Select server
                  </button>
                  <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
                    <a className='dropdown-item' href='#'>Action</a>
                    <a className='dropdown-item' href='#'>Another action</a>
                    <a className='dropdown-item' href='#'>Something else here</a>
                  </div>
                </div>
              </div>
              <input className='form-control' id='serverInput' type='text' value={this.state.url} onChange={this.updateUrl} />
            </div>
          </div>
        </form>
        <textarea id='yasqe-editor' />
        <QueryExecutor query={this.state.query} url={this.state.url} />
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

  updateUrl (event) {
    this.setState({
      url: event.target.value
    })
  }
}

export default SparqlEditor

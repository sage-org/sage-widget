import React, { Component } from 'react'
import QueryExecutor from '../query-executor/QueryExecutor.js'
import YASQE from 'yasgui-yasqe'
import sortBy from 'lodash.sortby'
import { DCTERMS, HYDRA, SAGE, SD, RDF, RDFS } from '../rdf.js'
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
    this.serverUrl = this.props.url
    if (this.serverUrl.endsWith('/')) {
      this.serverUrl = this.serverUrl.substring(0, this.serverUrl.length - 1)
    }
    this.state = {
      query: 'defaultQuery' in this.props ? this.props.defaultQuery : '',
      queryName: 'defaultQName' in this.props ? this.props.defaultQName : '',
      url: 'defaultServer' in this.props ? this.props.defaultServer : '',
      urls: [],
      queries: []
    }
    this.updateUrl = this.updateUrl.bind(this)
    this.setUrl = this.setUrl.bind(this)
    this.setPresetQuery = this.setPresetQuery.bind(this)
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
                  <div className='dropdown-menu scrollable-menu' aria-labelledby='dropdownMenuButton'>
                    {this.state.urls.map(s => (
                      <a className='dropdown-item' key={s.url} href={s.url} onClick={this.setUrl}>{s.name}</a>
                    ))}
                  </div>
                </div>
              </div>
              <input className='form-control' id='serverInput' type='text' value={this.state.url} onChange={this.updateUrl} />
            </div>
          </div>

          <div className='form-group'>
            <label for='queryName'><strong>Preset query:</strong></label>
            <div className='input-group'>
              <div className='input-group-prepend'>
                <div className='dropdown'>
                  <button className='btn btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                    Preset queries
                  </button>
                  <div className='dropdown-menu scrollable-menu' aria-labelledby='dropdownMenuButton'>
                    {this.state.queries.map(q => (
                      <a className='dropdown-item' key={q.name} qValue={q.value} href={q.url} onClick={this.setPresetQuery}>{q.name}</a>
                    ))}
                  </div>
                </div>
              </div>
              <input className='form-control' id='queryName' type='text' value={this.state.queryName} disabled />
            </div>
          </div>
        </form>
        <textarea id='yasqe-editor' />
        <QueryExecutor query={this.state.query} url={this.state.url} />
      </div>
    )
  }

  componentDidMount () {
    // download VoID descriptors to build menus
    this._getVoidDescriptor(this.serverUrl)
      .then(data => this._buildMenus(data))
    // setup YASQE text editor
    this.yasqe = YASQE.fromTextArea(document.getElementById('yasqe-editor'))
    this.yasqe.setValue(this.state.query)
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

  _getVoidDescriptor (baseUrl) {
    const headers = new Headers()
    headers.append('Accept', 'application/json')
    const request = new Request(`${baseUrl}/void`, {
      headers
    })
    return fetch(request)
      .then(res => res.json())
      .then(body => {
        const map = new Map()
        body.forEach(entity => {
          map.set(entity['@id'], entity)
        })
        return map
      })
  }

  _buildMenus (descriptor) {
    const root = descriptor.get(this.serverUrl)
    const graphCollec = root[SD('availableGraphs')][0]
    // get all graphs provided by the Sage endpoint
    const graphs = descriptor
      .get(graphCollec['@id'])[SD('namedGraph')]
      .map(g => {
        const id = descriptor.get(g['@id'])[SD('graph')][0]['@id']
        return descriptor.get(id)
      })
    const urls = sortBy(graphs.map(g => {
      return {
        name: g[DCTERMS('title')][0]['@value'],
        url: g[HYDRA('entrypoint')][0]['@id']
      }
    }), ['name'])
    let queries = []
    graphs.forEach(g => {
      if (SAGE('hasExampleQuery') in g) {
        g[SAGE('hasExampleQuery')]
          .map(x => descriptor.get(x['@id']))
          .forEach(q => {
            queries.push({
              url: g[HYDRA('entrypoint')][0]['@id'],
              name: q[RDFS('label')][0]['@value'],
              value: q[RDF('value')][0]['@value']
            })
          })
      }
    })
    queries = sortBy(queries, q => q.name)
    this.setState({
      url: (this.state.url === '') ? urls[0].url : this.state.url,
      urls,
      queries
    })
  }

  updateUrl (event) {
    this.setState({
      url: event.target.value
    })
  }

  setUrl (event) {
    event.preventDefault()
    this.setState({
      url: event.target.href
    })
  }

  setPresetQuery (event) {
    event.preventDefault()
    this.yasqe.setValue(event.target.attributes.getNamedItem('qvalue').value)
    this.setState({
      url: event.target.href,
      queryName: event.target.innerText,
      query: event.target.attributes.getNamedItem('qvalue').value
    })
  }
}

export default SparqlEditor

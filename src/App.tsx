import React from 'react'
import VoIDService from './void/void-service'
import logo from './logo.svg'
import './App.css'

export default class App extends React.Component {
  constructor (props: any) {
    super(props)
    VoIDService.queryVoID('http://soyez-sage.univ-nantes.fr/void/')
    .then(console.log)
  }

  render () {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    );
  }
}

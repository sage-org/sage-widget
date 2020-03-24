import React from 'react'
import Dataset from './void/dataset'
import DatasetFactory from './void/dataset-factory'
import './App.css'

interface AppProps {
  url: string
}

interface AppState {
  dataset: Dataset | null
}

export default class App extends React.Component<AppProps, AppState> {
  constructor (props: AppProps) {
    super(props)
    this.state = {
      dataset: null
    }
  }

  componentDidMount () {
    const factory = new DatasetFactory()
    factory.fromURI(this.props.url)
      .then(dataset => this.setState({ dataset }))
  }

  render () {
    return (
      <div>
        <p>
          {this.state.dataset?.name}
        </p>
      </div>
    );
  }
}

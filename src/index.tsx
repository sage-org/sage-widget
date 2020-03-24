import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './ui/App';
import * as serviceWorker from './serviceWorker';

const root = document.getElementById('sage-widget')

ReactDOM.render(
  <React.StrictMode>
    <App url='http://soyez-sage.univ-nantes.fr/void/'/>
  </React.StrictMode>,
  root
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

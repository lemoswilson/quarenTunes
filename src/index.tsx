import './index.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route } from 'react-router-dom'
import * as serviceWorker from './serviceWorker';
import App from './App';
import HomePage from './components/Layout/HomePage/HomePage';
import SignUp from './components/Layout/SignUp/SignUp';
import Xolombrisx from './containers/Xolombrisx';
import { createStore } from 'redux';
import { Provider } from 'react-redux';


ReactDOM.render(
  <React.StrictMode>
    <App />
    {/* <BrowserRouter>
      <App>
        <Route path={'/'} component={HomePage}></Route>
        <Route path={'/app'} component={Xolombrisx}></Route>
        <Route path={'/signin'} component={HomePage}></Route>
        <Route path={'/signup'} component={SignUp}></Route>
        <Route path={'/contact'} component={HomePage}></Route>
        <Route path={'/dashboard'} component={HomePage}></Route>
      </App>
    </BrowserRouter> */}
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

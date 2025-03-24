import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { setAuthToken } from './services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';

// Set authentication token from localStorage if it exists
const token = localStorage.getItem('token');
setAuthToken(token);

ReactDOM.render(<App />, document.getElementById('root'));

serviceWorker.unregister();

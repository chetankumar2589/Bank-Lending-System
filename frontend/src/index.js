import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Dynamically determine basename from process.env.PUBLIC_URL, which is set by React scripts
// based on the "homepage" field in package.json during build.
const basename = process.env.PUBLIC_URL;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter basename={basename}> {/* Add the basename prop here */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

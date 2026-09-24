import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './theme-lab.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const theme = process.env.REACT_APP_THEME;
const normalizedTheme = theme ? theme.trim().toLowerCase() : '';

if (!normalizedTheme) {
  document.documentElement.setAttribute('data-theme', 'verdant-rose');
} else if (normalizedTheme === 'original') {
  document.documentElement.removeAttribute('data-theme');
} else {
  document.documentElement.setAttribute('data-theme', theme);
}

/* Which commit is live: <html data-build="bbfbc0b">. deploy.ps1 sets it, and
   because it is part of the bundle, every deploy's main.js gets a fresh name. */
document.documentElement.setAttribute('data-build', process.env.REACT_APP_BUILD_ID || 'dev');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

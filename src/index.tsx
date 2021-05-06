import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

export async function loadEnv(): Promise<void> {
  await fetch('/env.json')
  .then(r => r.json())
  .then(
      env => {
        Object.keys(env).forEach((k)=>{
          localStorage.setItem(k, env[k])
        })
      }
  );
}

loadEnv()
.then(() => {
  ReactDOM.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
      document.getElementById('root')
  );
});



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

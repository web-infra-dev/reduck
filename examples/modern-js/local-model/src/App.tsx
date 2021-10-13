import { Switch, Route } from '@modern-js/runtime/router';

import './App.css';

const App = () => (
  <Switch>
    <Route exact={true} path="/">
      <div className="container">
        <main>
          <div className="logo">
            <img
              src="https://lf3-static.bytednsdoc.com/obj/eden-cn/ylaelkeh7nuhfnuhf/modernjs-cover.png"
              width="300"
              alt="Modern.js Logo"
            />
          </div>
          <p className="description">
            Get started by editing <code className="code">src/App.tsx</code>
          </p>
          <div className="grid">
            <a href="#" className="card">
              <h2>Quick Start</h2>
            </a>
            <a href="#" className="card">
              <h2>Handbook</h2>
            </a>
            <a href="#" className="card">
              <h2>API Reference </h2>
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="card">
              <h2>Community </h2>
            </a>
          </div>
        </main>
        <footer className="footer">
          <a href="#" target="_blank" rel="noopener noreferrer">
            Powered by Modern.JS
          </a>
        </footer>
      </div>
    </Route>
    <Route path="*">
      <div>404</div>
    </Route>
  </Switch>
);

export default App;

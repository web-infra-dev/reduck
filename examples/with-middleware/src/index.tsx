import ReactDOM from 'react-dom/client';
import { Provider } from '@modern-js-reduck/react';
import App from './App';
import logger from 'redux-logger';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider config={{ middlewares: [logger] }}>
    <App />
  </Provider>,
);

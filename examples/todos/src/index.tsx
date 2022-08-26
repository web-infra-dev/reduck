import ReactDOM from 'react-dom/client';
import { Provider } from '@modern-js-reduck/react';
import App from './components/App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Provider>
    <App />
  </Provider>,
);

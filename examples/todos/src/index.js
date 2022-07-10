import React from "react";
// import ReactDOM from "react-dom/client";
import ReactDOM from "react-dom"
import { createStore } from "@modern-js-reduck/store";
import immer from "@modern-js-reduck/plugin-immutable";
import devTools from "@modern-js-reduck/plugin-devtools";
import { Provider } from "@modern-js-reduck/react";
import App from "./components/App";

const store = createStore({ plugins: [devTools({}), immer] });

// const root = ReactDOM.createRoot(document.getElementById("root"));
// root.render(
//   <React.StrictMode>
//     <Provider store={store}>
//       <App />
//     </Provider>
//   </React.StrictMode>
// );

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root'),
);


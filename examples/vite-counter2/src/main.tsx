// import React from "react";
import {createRoot} from "react-dom/client";
import App from "./App";
import { createApp } from "@reduck/core";

// ReactDOM.render(
//   <React.StrictMode>
//     <Provider>
//       <App />
//     </Provider>
//   </React.StrictMode>,
//   document.getElementById("root")!
// );

const Provider = createApp({
  disableLogger: true,
})(App);



createRoot(document.getElementById("root")!).render(
  (<Provider>
    <App />
  </Provider>)
)

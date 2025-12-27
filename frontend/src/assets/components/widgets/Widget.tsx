import React from "react";
import ReactDOM from "react-dom/client";
import App from "./Wdhome.jsx";

function mountWidget() {
  const containerId = "my-widget";
  let container = document.getElementById(containerId);

  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    document.body.appendChild(container);
  }

  ReactDOM.createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

mountWidget();
export default mountWidget;

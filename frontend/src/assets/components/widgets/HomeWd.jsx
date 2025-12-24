import { createRoot } from "react-dom/client";
import Widget from "./Widget.jsx";
function initWidget() {
  let container = document.getElementById("my-widget");

  if (!container) {
    container = document.createElement("div");
    container.id = "my-widget";
    document.body.appendChild(container);
  }

  const root = createRoot(container);
//  root.render(<Widget />);
}

initWidget();
export default function HomeWd() {
  return (
    <div>
      <h2>Home Widget Page</h2>
      <div id="my-widget-container"></div>
      <div id="my-widget-container"></div>
      <Widget />
    </div>
  );
}
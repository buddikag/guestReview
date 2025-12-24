export default function Widget() {
  return (
    <div className="widget-box">
      <h3>Embedded React Widget</h3>
      <button onClick={() => alert("Hello from widget!")}>
        Click me
      </button>
    </div>
  );
}
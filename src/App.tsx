import { useState } from "react";
import "./App.css";
import { useRef } from "react";

function App() {
  const fileInputRef = useRef();

  return (
    <div className="App">
      <h1>Bitmap Parser</h1>
      <div className="card">
        <input type="file" ref={fileInputRef} />
        <button>Parse Bitmap</button>
        <p>
          Upload a <code>Bitmap (*.bmp)</code> to see the bitmap drawn in the
          canvas below after being parsed.
        </p>
      </div>
      <canvas id="displayer"></canvas>
    </div>
  );
}

export default App;

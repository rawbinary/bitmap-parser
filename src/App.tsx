import React from "react";
import "./App.css";
import { useRef } from "react";

import { parseBitmap } from "../lib/bitmap";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!fileInputRef) return alert("Unknown Error Occurred!");

    const fileItem = fileInputRef.current?.files?.item(0);
    if (!fileItem) return alert("No any valid file selected.");

    // Initial Test, checking from file.type
    if (fileItem.type != "image/bmp") return alert("Not a valid BMP file.");

    // Reading File
    const reader = new FileReader();
    reader.onload = () => {
      const bmp = parseBitmap(reader.result as ArrayBuffer);
      // console.log(bmp);
    };

    reader.readAsArrayBuffer(fileItem);
  };

  return (
    <div className="App">
      <h1>Bitmap Parser</h1>
      <div className="card">
        <input type="file" ref={fileInputRef} />
        <button onClick={(e) => handleFile(e)}>Parse Bitmap</button>
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

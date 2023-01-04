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
      try {
        const bmp = parseBitmap(reader.result as ArrayBuffer);

        // fill table with info
        const table = document.createElement("table");
        for (let prop of Object.keys(bmp)) {
          let tr = document.createElement("tr");
          let td1 = document.createElement("td");
          let td2 = document.createElement("td");
          let text1 = document.createTextNode(prop);
          let text2 = document.createTextNode((bmp as any)[prop] as string);
          td1.appendChild(text1);
          td2.appendChild(text2);
          tr.appendChild(td1);
          tr.appendChild(td2);

          table.appendChild(tr);
        }
        document.getElementById("info")?.appendChild(table);

        const pixelData = bmp.BitmapHexValues();

        // Create image in canvas
        const canvas = document.getElementById(
          "displayer"
        ) as HTMLCanvasElement;
        canvas.height = bmp.Height;
        canvas.width = bmp.Width;
        // console.log(pixelData);
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        let offset = 0;
        for (let i = 0; i < bmp.Height; i++) {
          for (let j = 0; j < bmp.Width; j++) {
            ctx.fillStyle = "#" + pixelData[offset];
            ctx.fillRect(j, i, 1, 1);
            offset++;
          }
        }
      } catch (error) {
        alert(error);
        throw error;
      }
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
      <div id="info"></div>
    </div>
  );
}

export default App;

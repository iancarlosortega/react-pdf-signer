# React PDF Signer

A React component for signing PDF documents with a simple and intuitive interface.

## Features

- Upload PDF documents
- View PDF documents in a modal
- Get the coordinates of the signature area

## Requirements
- React 16.8 or higher
- Tailwind CSS 3.0 or higher
- React PDF 5.0.0 or higher
```bash
npm install react-pdf
```

## Installation

- Using npm:
```bash
npm install react-pdf-signer
```
- Configure styles on tailwind.config.js:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/react-pdf-signer/dist/index.esm.{js,ts}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Usage
- Import the react-pdf worker in your main file (e.g., index.js or App.js):
```javascript
import { pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

- Use the component in your application:
```javascript
import { PdfSigner } from "react-pdf-signer";

return (
  <div className="App">
    <PdfSigner
      onPdfClick={(signatureArea) => {
        console.log(signatureArea);
      }}
    />
  </div>
);
```

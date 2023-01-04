# Bitmap Parser

A typescript implementation of Bitmap Parser, and visualiser for Bitmap in HTML5 Canvas.

## Why?

Why not. This is a bitmap parser written in Typescript for me to understand how Bitmaps and basically how digital image files work, how they're compressed, uncompressed, stored, encoded, decoded, parsed, etc.

**No any thirdparty library is used for any image parsing wor, everything is fully self-coded for the sake of understanding every aspect of image parsing.**

## Bitmap Parsing

All the bitmap parsing related codes are found inside `lib` directory. Other folders are for the HTML/JS side of the project for displaying the image on canvas and user interface for demo.

First, to read buffers to struct like in C-style, we create a BufferStructure and Types, which takes the buffer, offset and bytesize of every property in struct
and creates an object of ArrayBuffer of specific bytes. This saved a lot of pain in the butt in the parser writing procedure.

### Structure of Bitmap

Structure of a bitmap file can be pretty different based of the types. Here, we only use the important bits of structure we need.

The C Struct Types have been used to show the buffer structure for easy demonstration.

#### **Bitmap File Header**

The first 14 bytes of the BMP file contains File Headers. File Header further has breakdown:

The C-style struct would be similar to below:

```c
struct BMP_FILEHEADER {
	uint16_t Signature;     // 2 bytes - BMP File Signature
	uint32_t Size;          // 4 bytes - Size of BMP File
	uint32_t Reserved;      // 4 bytes = Reserved buffer generally used by application creating the image
	uint32_t BitsOffset;    // 4 bytes = Offset at which the pixel data starts
};
```

We, then check the validity of the BMP file with BMP Signature, i.e.

```c
0x4d42; // little endian
```

#### **Bitmap Image Header**

DIB Header contains detailed information about the image, which is used to parse and display image properly. The size of this header differs from version and type of the BMP. The first 4 bytes of this header tells the size of the header.

We could also use the `BitsOffset` value from the `BMP_FILEHEADER` to directly get to the pixel data, with starts after this header.

The C-style struct would be similar to below:

```c
struct BMP_HEADER {
	uint32_t HeaderSize;        // 4 bytes - The size of this header
	int32_t Width;              // 4 bytes - Width of the Image in pixels
	int32_t Height;             // 4 bytes - Height of the Image in pixels
	uint16_t ColorPlanes;       // 2 bytes - Number of color planes
	uint16_t BitDepth;          // 2 bytes - Number of bits per pixel; usually 8, 16, 24 and 32
	uint32_t CompressionMethod; // 4 bytes - Compression Method used
	uint32_t ImageSize;         // 4 bytes - Size of the bitmap pixel data
	int32_t PixPerMeterX;       // 4 bytes - Horizontal res; pixel per meter (signed int)
	int32_t PixPerMeterY;       // 4 bytes - Vertical res; pixel per meter (signed int)
	uint32_t ColorCount;        // 4 bytes - no. of colors in color palette
	uint32_t ImpColorCount;     // 4 bytes - no. of imp. colors; usually ignored
};
```

#### **Pixel Data**

After reading the required data from the header, we skip all other headers to directly read from the pixel data offset we received from `BMP_FILEHEADER.BitsOffset` value.

The Pixel data is a block of 32-bit DWORDs. Usually pixels are stored "bottom-up", starting from lower-left corner, going from left to right. So, at the end of everything, we reverse the pixel array to make it straight.

Padding bytes must be appended to the end of the rows in order to bring up the length of the rows to a multiple of four bytes. When the pixel array is loaded into memory, each row must begin at a memory address that is a multiple of 4. This address/offset restriction is mandatory only for pixel arrays loaded in memory. For file storage purposes, only the size of each row must be a multiple of 4 bytes while the file offset can be arbitrary. A 24-bit bitmap with Width=1, would have 3 bytes of data per row (blue, green, red) and 1 byte of padding, while Width=2 would have 6 bytes of data and 2 bytes of padding, Width=3 would have 9 bytes of data and 3 bytes of padding, and Width=4 would have 12 bytes of data and no padding.

We take a basic and simple approach of taking the pixel data of the row, and getting its hex-value string and spliting it every 6 characters, which shall give the `BBGGRR` value of the pixels. Then transforming that into `RRGGBB`, it'd be similar to a RGB Hex color value.

Using this color values, we then created a canvas of size of BMP, then filled it with rectangles of `1px x 1px` with RGB Hex color value generate for every pixel. This will render the parsed BMP into the canvas.

```js
  // Pixel Data Processing
  let BitmapData: string[][] = [];

  let offset = 0;
  for (let i = 0; i < HEIGHT; i++) {
    let lineBuffer = pixelArrayBuffer.slice(offset, offset + lineWidth);
    offset += lineWidth;

    // Get the Hex String, split it every 6 chars (which is RGB Hex color code of pixel for 24-bit BMP)
	// [3 x 8 for BGR Channel, remaing byte is ignored as padding]
    const LineHexArray = splitInto(buf2hex(new Uint8Array(lineBuffer)), 6);

    // Since the RGB is flipped i.e. BGR (we reverse it)
    const RGBLineHexArray = LineHexArray.map((x) => {
      return splitInto(x, 2).reverse().join("");
    });
    BitmapData.push(RGBLineHexArray);
  }
  // Finally flipping the Pixel Data; as pixel array is "bottom-up"
  BitmapData.reverse();
``

## Tools Used

- React for Web Interface of Demo App
- Vite for Build Tooling
- Tailwind for web interface design system
- Typescript

## Getting Started

Setup

1. Clone repo
1. `npm install`
1. Run dev server `npm run dev`
```

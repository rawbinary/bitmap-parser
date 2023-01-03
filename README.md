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

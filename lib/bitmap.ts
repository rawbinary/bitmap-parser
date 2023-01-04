// To simulate C style, Struct buffer reading. For ease :P
const BufferStructure = {
  from: <K extends { [key: string]: number }>(
    arrayBuffer: ArrayBuffer,
    startOffset: number,
    bufferStruct: K
  ) => {
    let retObj: Record<keyof K, ArrayBuffer> = {} as Record<
      keyof K,
      ArrayBuffer
    >;
    let offset = 0;
    for (let prop in bufferStruct) {
      let tmpBuffer = arrayBuffer.slice(
        startOffset + offset,
        startOffset + offset + bufferStruct[prop]
      );
      offset += bufferStruct[prop];
      retObj[prop] = tmpBuffer;
    }
    return retObj;
  },

  Types: {
    uint8: 1,
    uint16: 2,
    uint32: 4,
    uint64: 8,
    int32: 4,
  },
};

// Array Buffer is technically a unsigned 8-bit int array
function byteArrayToInt(byteArray: ArrayBuffer) {
  let dv = new Uint8Array(byteArray);
  let value = 0;
  for (var i = dv.byteLength - 1; i >= 0; i--) {
    value = value * 256 + dv[i];
  }
  return value;
}

// Required for offset calculation after reading a struct
function getStructSize(struct: Record<string, number>) {
  let totSize = 0;
  for (const prop in struct) {
    totSize += struct[prop];
  }
  return totSize;
}

enum CompressionMethod {
  BI_RGB,
  BI_RLE8,
  BI_RLE4,
  BI_BITFIELDS,
  BI_JPEG,
  BI_PNG,
  BI_ALPHABITFIELDS,
  BI_CMYK = 11,
  BI_CMYKRLE8 = 12,
  BI_CMYKRLE4 = 13,
}

const BitmapFileHeaderStruct = {
  // Signature of the File
  Signature: BufferStructure.Types.uint16,
  // Size of the BMP
  Size: BufferStructure.Types.uint32,
  // Reserved Buffer; Application Specific
  Reserved: BufferStructure.Types.uint32,
  // Offset from where Pixel data starts
  BitsOffset: BufferStructure.Types.uint32,
};

const BitmapHeaderStruct = {
  // Size of this Header Block
  HeaderSize: BufferStructure.Types.uint32,
  // Width of Image in Pixels
  Width: BufferStructure.Types.int32,
  // Height of Image in Pixels
  Height: BufferStructure.Types.int32,
  // Numver of color planes
  ColorPlanes: BufferStructure.Types.uint16,
  // Number of bits per pixel [usually 8, 16, 24 and 32]
  BitDepth: BufferStructure.Types.uint16,
  // Compression Method used
  CompressionMethod: BufferStructure.Types.uint32,
  // Size of the Bitmap Pixel Data
  ImageSize: BufferStructure.Types.uint32,
  // Horizontal res; pixel per meter (signed integer)
  PixPerMeterX: BufferStructure.Types.int32,
  // Vertical res; pixel mer meter (signed integer) [pixel data generally flipped vertically]
  PixPerMeterY: BufferStructure.Types.int32,
  // no. of colors in color palette
  ColorCount: BufferStructure.Types.uint32,
  // no. of imp. colors, or 0 if all important; usually ignored
  ImpColorCount: BufferStructure.Types.uint32,
};

export function parseBitmap(bitmapBuffer: ArrayBuffer) {
  // Bitmap Signature [in little Endian]
  const bmpSignature = 0x4d42;

  // Reading BMP File Struct
  const bmpFileHeader = BufferStructure.from(
    bitmapBuffer,
    0,
    BitmapFileHeaderStruct
  );

  // First 2 bytes in the buffer are BMP Signature
  if (byteArrayToInt(bmpFileHeader.Signature) !== bmpSignature)
    throw "Invalid BMP Buffer. Not a valid BMP File";

  const bmpHeader = BufferStructure.from(
    bitmapBuffer,
    getStructSize(BitmapFileHeaderStruct),
    BitmapHeaderStruct
  );

  const COLOR_COUNT = byteArrayToInt(bmpHeader.ColorCount);
  //   if (COLOR_COUNT !== 0) {
  //     throw "Unsupported Color Count.";
  //   }

  const COMPRESSION = byteArrayToInt(bmpHeader.CompressionMethod);
  // TODO: Currently only supports uncompressed BMPs; planned support for compressed in future
  if (COMPRESSION !== CompressionMethod.BI_RGB) {
    throw "Unsupported Compression Method";
  }

  // Pixel Array
  const WIDTH = Math.abs(byteArrayToInt(bmpHeader.Width));
  const HEIGHT = Math.abs(byteArrayToInt(bmpHeader.Height));
  const BIT_DEPTH = byteArrayToInt(bmpHeader.BitDepth);

  const pixelArrayOffset = byteArrayToInt(bmpFileHeader.BitsOffset);
  const pixelArrayBuffer = bitmapBuffer.slice(pixelArrayOffset);

  const lineWidth = ((WIDTH * BIT_DEPTH) / 8 + 3) & ~3;

  // Pixel Data Processing
  let BitmapData: any[] = [];

  let offset = 0;
  for (let i = 0; i < HEIGHT; i++) {
    let lineBuffer = pixelArrayBuffer.slice(offset, offset + lineWidth);
    offset += lineWidth;

    // Get the Hex String, split it every 6 chars (which is RGB Hex color code of pixel for 24-bit BMP) [4 x 6 for BGRA Channel]
    const LineHexArray = splitInto(buf2hex(new Uint8Array(lineBuffer)), 6);

    // Since the RGB is flipped i.e. BGR (we reverse it)
    const RGBLineHexArray = LineHexArray.map((x) => {
      return splitInto(x, 2).reverse().join("");
    });
    BitmapData.push(RGBLineHexArray);
  }

  BitmapData.reverse();

  return {
    Signature: new TextDecoder().decode(bmpFileHeader.Signature),
    Size: byteArrayToInt(bmpFileHeader.Size),
    Reserved: buf2hex(new Uint8Array(bmpFileHeader.Reserved)),
    BitsOffset: pixelArrayOffset,
    HeaderSize: byteArrayToInt(bmpHeader.HeaderSize),
    Width: WIDTH,
    Height: HEIGHT,
    ColorPlanes: byteArrayToInt(bmpHeader.ColorPlanes),
    BitDepth: BIT_DEPTH,
    ImageSize: byteArrayToInt(bmpHeader.ImageSize),
    CompressionMethod: getCompressionMethod(COMPRESSION),
    PixPerMeterX: byteArrayToInt(bmpHeader.PixPerMeterX),
    PixPerMeterY: byteArrayToInt(bmpHeader.PixPerMeterY),
    ColorCount: COLOR_COUNT,
    ImpColorCount: byteArrayToInt(bmpHeader.ImpColorCount),
    BitmapHexValues: () => BitmapData as string[][],
  };
}

function splitInto(str: string, len: number) {
  var regex = new RegExp(".{" + len + "}|.{1," + Number(len - 1) + "}", "g");
  return str.match(regex) as string[];
}

function getCompressionMethod(method: number) {
  return CompressionMethod[method];
}

function buf2hex(buffer: Uint8Array) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

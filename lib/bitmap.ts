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
}

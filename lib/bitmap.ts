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

export function parseBitmap(bitmapBuffer: ArrayBuffer) {
  // Bitmap Signature [in Small Endian]
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
}

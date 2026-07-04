"use strict";

const fs = require("fs");
const zlib = require("zlib");

const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;

if (!inputPath) {
  console.error("Usage: node tools/chroma-key-png.js <input.png> [output.png]");
  process.exit(1);
}

function readChunks(buffer) {
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    throw new Error("Input is not a PNG file.");
  }

  const chunks = [];
  let offset = 8;
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    chunks.push({ type, data });
    offset += 12 + length;
    if (type === "IEND") {
      break;
    }
  }
  return chunks;
}

function bytesPerPixel(colorType) {
  if (colorType === 2) return 3;
  if (colorType === 6) return 4;
  throw new Error(`Unsupported PNG color type: ${colorType}. Expected truecolor RGB/RGBA.`);
}

function unfilterScanlines(inflated, width, height, bpp) {
  const stride = width * bpp;
  const pixels = Buffer.alloc(stride * height);
  let sourceOffset = 0;
  let targetOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;

    for (let x = 0; x < stride; x += 1) {
      const raw = inflated[sourceOffset + x];
      const left = x >= bpp ? pixels[targetOffset + x - bpp] : 0;
      const up = y > 0 ? pixels[targetOffset + x - stride] : 0;
      const upLeft = y > 0 && x >= bpp ? pixels[targetOffset + x - stride - bpp] : 0;

      let value;
      if (filter === 0) {
        value = raw;
      } else if (filter === 1) {
        value = raw + left;
      } else if (filter === 2) {
        value = raw + up;
      } else if (filter === 3) {
        value = raw + Math.floor((left + up) / 2);
      } else if (filter === 4) {
        value = raw + paeth(left, up, upLeft);
      } else {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }

      pixels[targetOffset + x] = value & 255;
    }

    sourceOffset += stride;
    targetOffset += stride;
  }

  return pixels;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function toRgba(source, width, height, colorType) {
  const bpp = bytesPerPixel(colorType);
  const rgba = Buffer.alloc(width * height * 4);

  for (let i = 0, j = 0; i < source.length; i += bpp, j += 4) {
    rgba[j] = source[i];
    rgba[j + 1] = source[i + 1];
    rgba[j + 2] = source[i + 2];
    rgba[j + 3] = colorType === 6 ? source[i + 3] : 255;
  }

  return rgba;
}

function applyChromaKey(rgba, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const r = rgba[index];
      const g = rgba[index + 1];
      const b = rgba[index + 2];
      const alpha = rgba[index + 3];
      const greenDominance = g - Math.max(r, b);
      const isGreenKey = g > 110 && greenDominance > 38 && g > r * 1.25 && g > b * 1.25;

      if (isGreenKey) {
        rgba[index + 3] = 0;
        continue;
      }

      if (alpha > 10) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return { rgba, width, height };
  }

  const padding = 8;
  minX = Math.max(0, minX - padding);
  minY = Math.max(0, minY - padding);
  maxX = Math.min(width - 1, maxX + padding);
  maxY = Math.min(height - 1, maxY + padding);

  const trimmedWidth = maxX - minX + 1;
  const trimmedHeight = maxY - minY + 1;
  const trimmed = Buffer.alloc(trimmedWidth * trimmedHeight * 4);

  for (let y = 0; y < trimmedHeight; y += 1) {
    const sourceStart = ((minY + y) * width + minX) * 4;
    const targetStart = y * trimmedWidth * 4;
    rgba.copy(trimmed, targetStart, sourceStart, sourceStart + trimmedWidth * 4);
  }

  return { rgba: trimmed, width: trimmedWidth, height: trimmedHeight };
}

function encodePng(rgba, width, height) {
  const stride = width * 4;
  const scanlines = Buffer.alloc((stride + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (stride + 1);
    scanlines[rowStart] = 0;
    rgba.copy(scanlines, rowStart + 1, y * stride, y * stride + stride);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  return Buffer.concat([
    PNG_SIGNATURE,
    makeChunk("IHDR", ihdr),
    makeChunk("IDAT", zlib.deflateSync(scanlines, { level: 9 })),
    makeChunk("IEND", Buffer.alloc(0))
  ]);
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const output = Buffer.alloc(12 + data.length);
  output.writeUInt32BE(data.length, 0);
  typeBuffer.copy(output, 4);
  data.copy(output, 8);
  output.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return output;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

const input = fs.readFileSync(inputPath);
const chunks = readChunks(input);
const ihdr = chunks.find((chunk) => chunk.type === "IHDR").data;
const width = ihdr.readUInt32BE(0);
const height = ihdr.readUInt32BE(4);
const bitDepth = ihdr[8];
const colorType = ihdr[9];
const interlace = ihdr[12];

if (bitDepth !== 8 || interlace !== 0) {
  throw new Error("Only 8-bit, non-interlaced PNG files are supported.");
}

const idat = Buffer.concat(chunks.filter((chunk) => chunk.type === "IDAT").map((chunk) => chunk.data));
const rawPixels = unfilterScanlines(zlib.inflateSync(idat), width, height, bytesPerPixel(colorType));
const rgba = toRgba(rawPixels, width, height, colorType);
const keyed = applyChromaKey(rgba, width, height);
fs.writeFileSync(outputPath, encodePng(keyed.rgba, keyed.width, keyed.height));
console.log(`${inputPath} -> ${outputPath} (${keyed.width}x${keyed.height}, alpha)`);

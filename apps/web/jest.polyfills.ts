import { ReadableStream, WritableStream, TransformStream } from 'node:stream/web';

Object.defineProperties(globalThis, {
  ReadableStream: { value: ReadableStream },
  WritableStream: { value: WritableStream },
  TransformStream: { value: TransformStream },
});

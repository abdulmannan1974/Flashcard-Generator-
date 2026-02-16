/// <reference types="vite/client" />

declare module 'mammoth' {
  export function extractRawText(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>;
}

declare module 'jszip' {
  interface JSZipFile {
    async(type: 'text'): Promise<string>;
    async(type: 'arraybuffer'): Promise<ArrayBuffer>;
  }
  interface JSZipObject {
    [key: string]: JSZipFile;
  }
  interface JSZipInstance {
    files: JSZipObject;
    file(name: string): JSZipFile | null;
  }
  export default class JSZip {
    static loadAsync(data: File | ArrayBuffer | Uint8Array): Promise<JSZipInstance>;
  }
}

export {}

declare global {
  interface FormData {
    entries(): IterableIterator<[string, FormDataEntryValue]>;
    [Symbol.iterator](): IterableIterator<[string, FormDataEntryValue]>; // 👈 இது சேர்த்தது முக்கியம்
  }
}

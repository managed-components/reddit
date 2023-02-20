declare module 'crypto' {
  namespace webcrypto {
    const randomUUID: () => string
    const subtle: SubtleCrypto
  }
}

export {}

declare global {
  namespace NodeJS {
    interface Global {
      __statics: string
    }
  }
}

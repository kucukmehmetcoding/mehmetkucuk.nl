declare module 'simhash' {
  export default class SimHash {
    constructor();
    hash(text: string): string;
    similar?(hashA: string, hashB: string): boolean;
  }
}

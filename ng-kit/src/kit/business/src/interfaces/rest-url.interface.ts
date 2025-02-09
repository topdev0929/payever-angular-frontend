export interface RestUrlInterface {
  [propName: string]: {
    (slug?: string,
     locale?: string,
     prefix?: string): string
  };
}

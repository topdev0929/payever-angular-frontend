export interface StrategyCache {
	[key: string]: any;
}


export interface StorageInterface {
  readonly length: number;

  clear(): void;

  getItem(key: string): string | null;

  removeItem(key: string): void;

  setItem(key: string, value: string): void;
}

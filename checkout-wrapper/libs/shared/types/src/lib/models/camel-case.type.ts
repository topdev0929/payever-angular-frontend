type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : S;

type ObjectToCamelCase<T> = {
    [K in keyof T as CamelCase<string &K>]: T[K] extends Record<string, K> ? KeysToCamelCase<T[K]> : T[K];
}

export type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string & K>]: T[K] extends Array<K>
        ? KeysToCamelCase<T[K][number]>[]
        : ObjectToCamelCase<T[K]>;
}

export interface NestedType<T = any> {
  [key: string]: T | NestedType<T>;
}

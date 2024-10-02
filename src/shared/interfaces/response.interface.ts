// response.interface.ts
export interface ResponseFormat<T> {
  message: string;
  code: number;
  data: T;
}

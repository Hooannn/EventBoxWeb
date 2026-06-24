import type { AxiosResponse } from "axios";

export interface IResponseData<T> {
  data: T;
  code: number;
  message: string;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  numberOfElements?: number;
}

export interface Response<T> extends AxiosResponse {
  data: IResponseData<T>;
}

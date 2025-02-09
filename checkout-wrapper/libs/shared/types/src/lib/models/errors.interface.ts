import { HttpErrorResponse } from '@angular/common/http';

export interface ErrorInterface {
  [propName: string]: string | ErrorInterface;
}

export interface ErrorSsnInterface {
  invalidValue: string;
  message: string;
  propertyPath: string;
}

export interface ResponseErrorsInterface {
  code: number;
  errors: ErrorInterface;
  message: string;
  raw: HttpErrorResponse;
}

export interface ResponseSsnErrorsInterface {
  code: number;
  errors: ErrorSsnInterface[];
  message: string;
}

export interface ResponseLoginErrorsInterface {
  code: number;
  errors: ErrorInterface;
  message: string;
}

export interface ErrorsV1ChildrenInterface {
  [propName: string]: {
    children?: ErrorsV1ChildrenInterface;
    errors?: string[];
  };
}

export interface ResponseErrorsV1Interface {
  code?: number;
  errors?: {
    children?: ErrorsV1ChildrenInterface;
    errors?: string[];
  };
  message?: string;
}

export interface RestValidationErrorsCacheInterface {
  date?: number;
  errors: ErrorInterface;
  flowId?: string;
  globalErrors: ErrorInterface;
}

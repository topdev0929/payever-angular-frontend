import { HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { ResponseErrorsInterface } from '@pe/checkout/types';

type ApiErrorTransformer = (error: ResponseErrorsInterface) => ResponseErrorsInterface;
type ApiErrorTransformers = Partial<{
  [key in HttpStatusCode]: ApiErrorTransformer
}>

@Injectable()
export class ApiErrorMessageTransformerService {
  transform(error: ResponseErrorsInterface): ResponseErrorsInterface {
    const transformFN = this.errorHandlers[error.code as HttpStatusCode];
    const newError = transformFN ? transformFN(error) : null;

    return newError || error;
  }

  private preconditionFailed(error: ResponseErrorsInterface): ResponseErrorsInterface {
    const msg = error.message?.toLowerCase();
    if (msg.includes('wrong credentials')) {
      return {
        ...error,
        message: $localize`:@@api_errors.payment_option.wrong_credentials:Wrong credentials`,
      };
    }

    return null;
  }

  private notFound(error: ResponseErrorsInterface): ResponseErrorsInterface {
    const msg = error?.raw?.error?.message;
    
    if (msg.includes('Connection not found')) {
      return {
        ...error,
        message: $localize`:@@api_errors.payment_option.account_not_connected:Not Found`,
      };
    }

    return null;
  }


  private errorHandlers: ApiErrorTransformers = {
    [HttpStatusCode.PreconditionFailed]: this.preconditionFailed,
    [HttpStatusCode.NotFound]: this.notFound,
  };
}

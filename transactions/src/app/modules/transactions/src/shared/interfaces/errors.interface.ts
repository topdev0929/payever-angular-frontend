export interface ErrorFormControlInterface {
  errors?: string[];
  children?: ErrorsFormChildrenInterface;
}

export interface ErrorsFormChildrenInterface {
  [propName: string]: ErrorFormControlInterface;
  models: any;
}

export interface ErrorsFormRootInterface {
  children: ErrorsFormChildrenInterface;
  message: string;
  errors?: ErrorFormControlInterface;
}

export interface ErrorsFormInterface {
  code?: number;
  error?: string;
  errors?: ErrorsFormRootInterface;
  children?: ErrorsFormChildrenInterface;
  message?: string;
}

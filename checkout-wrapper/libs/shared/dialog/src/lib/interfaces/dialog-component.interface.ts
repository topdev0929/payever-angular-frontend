import { DialogRef } from '../classes';

export interface DialogComponentInterface<R = any> {
  dialogRef: DialogRef<any, R>;
}

import { EditorRequest } from './editor-request.enum';

export interface EditorRequestInterface<T> {
  type: EditorRequest;
  data?: T;
}

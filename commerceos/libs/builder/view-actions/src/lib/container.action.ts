import { PebRenderContainer } from "@pe/builder/core";

export class PebViewContainerSetAction {
  static readonly type = '[PEB/View] Container Set';
  constructor(
    public container: PebRenderContainer,
  ) {
  }
}

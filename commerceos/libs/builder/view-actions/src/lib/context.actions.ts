import { PebContextTree, PebMap, PebRootContext } from "@pe/builder/core";

export class PebViewContextSetRootAction {
  static readonly type = '[PEB/View] Context Set Root';

  constructor(
    public root: PebRootContext,
  ) {
  }
}

export class PebViewContextSetAction {
  static readonly type = '[PEB/View] Context Set';

  constructor(
    public contexts: PebMap<PebContextTree>,
  ) {
  }
}

export class PebViewContextResetAction {
  static readonly type = '[PEB/View] Context Reset';
}

export class PebViewContextUpdateAction {
  static readonly type = '[PEB/View] Context Update';

  constructor(
    public updates: PebMap<PebContextTree>,
  ) {
  }
}

export class PebViewContextUpdatedAction {
  static type = '[PEB/View] Context Updates';

  constructor(
    public updates: PebMap<PebContextTree>,
  ) {
  }
}

export class PebViewContextRenderAllAction {
  static readonly type = '[PEB/View] Context Render All';
}

export class PebViewContextRenderAction {
  static readonly type = '[PEB/View] Context Render';

  constructor(
    public context: PebContextTree,
  ) {
  }
}

export class PebViewContextResolveRootAction {
  static type = '[PEB/View] Context Resolve';
}

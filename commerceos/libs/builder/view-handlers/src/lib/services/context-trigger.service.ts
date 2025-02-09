import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { isEqual } from 'lodash';

import { PebAnimationKeyframeMapper, PebAnimationTriggerSetting } from '@pe/builder/core';
import { evaluate } from '@pe/builder/render-utils';
import { PebViewState } from '@pe/builder/view-state';

@Injectable()
export class PebViewContextTriggerService {
  constructor(
    private readonly store: Store,
  ) {
  }

  getTriggerKeyframe(triggerSetting: PebAnimationTriggerSetting, elementId: string): number {
    const contexts = this.store.selectSnapshot(PebViewState.contexts);
    const contextsWithUniqueTag = Object.values(contexts).filter(ctx => ctx.uniqueTag === triggerSetting.contextTag);
    const context = contextsWithUniqueTag.find(ctx => !ctx.integration?.contextField?.eval) ?? contextsWithUniqueTag[0];
    if (!context) {
      return 0;
    }

    const leftValue =
      triggerSetting.contextField === context.integration?.contextField?.eval && triggerSetting.contextField
        ? context.fields?.originalData
        : evaluate(triggerSetting.contextField, context.fields);

    const rightValue = contexts[elementId]?.value;

    if (leftValue === undefined && rightValue === undefined) {
      return 0;
    }

    if (triggerSetting.keyframeMapper === PebAnimationKeyframeMapper.ContextIsEqual) {
      return leftValue?.id && leftValue.id === rightValue?.id || isEqual(leftValue, rightValue)
        ? 1
        : 0;
    }

    if (triggerSetting.keyframeMapper === PebAnimationKeyframeMapper.ContextIsSet) {
      return leftValue ? 1 : 0;
    }

    if (triggerSetting.keyframeMapper === PebAnimationKeyframeMapper.ContextArraySize) {
      return leftValue?.length || 0;
    }

    return 0;
  }

}

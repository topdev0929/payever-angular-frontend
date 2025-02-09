import { PebElementType } from '@pe/builder-core';
import { PebBehaviorType } from '@pe/builder-editor/projects/modules/editor/src/constants';
import { PeFeatureFlag, PeFeatureFlagActionEnum, PeFeatureFlagBehaviorData } from '@pe/feature-flag';

/**
 * NOTE: This file has feature flags for "light" subscriptions plan.
 * Further these flags should be fetched from backend.
 *
 * Feature flags restrict user interaction with UI
 */

const builderEditorFlags: PeFeatureFlag[] = [
  // Builder-editor flags
  {
    name: 'text.move',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.move,
      elementType: PebElementType.Text,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'text.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeElement,
      elementType: PebElementType.Text,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'image.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeElement,
      elementType: PebElementType.Image,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'shape.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeElement,
      elementType: PebElementType.Shape,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'block.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeElement,
      elementType: PebElementType.Block,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'product.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeProduct,
      elementType: PebElementType.Product,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'section.resize',
    action: PeFeatureFlagActionEnum.Disable,
    data: {
      behaviorType: PebBehaviorType.resizeSection,
      elementType: PebElementType.Section,
    } as PeFeatureFlagBehaviorData,
  },
  {
    name: 'create_blank_page',
    action: PeFeatureFlagActionEnum.Hide,
  },
];

const builderFlags: PeFeatureFlag[] = [
  {
    name: 'add_widget.text',
    action: PeFeatureFlagActionEnum.Hide,
  },
  {
    name: 'add_widget.image',
    action: PeFeatureFlagActionEnum.Hide,
  },
  {
    name: 'add_widget.product',
    action: PeFeatureFlagActionEnum.Hide,
  },
  {
    name: 'add_widget.product_page',
    action: PeFeatureFlagActionEnum.Hide,
  },
  {
    name: 'add_widget.shape_group',
    action: PeFeatureFlagActionEnum.Hide,
  },
  {
    name: 'add_section',
    action: PeFeatureFlagActionEnum.Hide,
  },
];

export const LIGHT_FEATURES: PeFeatureFlag[] = [
  ...builderEditorFlags,
  ...builderFlags,
];

export const PREMIUM_FEAUTRES: PeFeatureFlag[] = [];

import { SectionType } from '../enums';

import { FlowSectionOptionsInterface } from './flow.interface';

export interface BaseAccordionPanelInterface {
  name: SectionType;
  steps: string[];
  opened?: boolean;
}

export interface AccordionPanelInterface extends BaseAccordionPanelInterface {
  disabled?: boolean;
  hidden?: boolean;
  hiddenByState?: boolean;
  step?: string; // TODO: try to get rid of...

  shouldSkip?: boolean;
  options?: FlowSectionOptionsInterface;
  excludedIntegrations?: string[];
  allowedOnlyIntegrations?: string[];
}

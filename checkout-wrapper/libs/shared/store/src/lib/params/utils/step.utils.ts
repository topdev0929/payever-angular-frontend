import {
  AccordionPanelInterface,
  CheckoutSettingsInterface,
  SectionType,
} from '@pe/checkout/types';


export function openNextStep(
  panels: AccordionPanelInterface[],
): AccordionPanelInterface[] {
  let passedOpenStep: boolean;

  const nextPanelIdx = panels.findIndex((panel) => {
    if (panel.opened) {
      passedOpenStep = true;

      return false;
    }

    return passedOpenStep && !panel.hidden && !panel.hiddenByState;
  });

  return panels.map((panel, idx) => ({
    ...({ ...panel, step: undefined }),
    opened: idx === nextPanelIdx,
    disabled: idx > nextPanelIdx,
    ...(idx === nextPanelIdx && { step: panel.steps[0] }),
  }));
}

export function disableNextPanels(
  panels: AccordionPanelInterface[],
  target: AccordionPanelInterface | SectionType,
): AccordionPanelInterface[] {
  const panelName = typeof target === 'object'
    ? target.name
    : target;

  let targetPassed: boolean;

  return panels.reduce((acc, panel) => {
    acc.push({
      ...panel,
      ...(targetPassed && { disabled: true }),
    });

    if (!targetPassed && panel.name === panelName) {
      targetPassed = true;
    }

    return acc;
  }, []);
}

export function openPanel(
  panels: AccordionPanelInterface[],
  target: AccordionPanelInterface | SectionType,
): AccordionPanelInterface[] {
  const panelName = typeof target == 'object'
    ? target.name
    : target;

  return panels.map(p => ({
    ...p,
    ...(p.name === panelName && { step: p.steps[0] }),
    opened: p.name === panelName,
  }));
}

export function hidePanels(
  panels: AccordionPanelInterface[],
  target: SectionType[] | SectionType,
): AccordionPanelInterface[] {
  const targets = Array.isArray(target) ? target : [target];

  return panels.map(panel => ({
    ...panel,
    ...(targets.includes(panel.name) && {
      step: undefined,
      opened: undefined,
      hidden: true,
    }),
  }));
}


export function hidePanelsByState(
  panels: AccordionPanelInterface[],
  target: SectionType[] | SectionType,
): AccordionPanelInterface[] {
  const steps = Array.isArray(target) ? target : [target];

  return panels.map(panel => ({
    ...panel,
    ...(steps.includes(panel.name) && {
      step: undefined,
      opened: undefined,
      hiddenByState: true,
    }),
  }));
}

export function isPanelHiddenForChannel(
  settings: CheckoutSettingsInterface,
  code: SectionType,
): boolean {
  const section = settings.sections.find(sect => sect.code === code);

  return section?.allowed_only_channels?.length
    ? !section.allowed_only_channels.includes(settings.channelType)
    : section?.excluded_channels.includes(settings.channelType);
}

import {
  PEB_DEFAULT_PAGINATION,
  PEB_ROOT_SCREEN_KEY,
  PebAPIDataSourceParams,
  PebContext,
  PebContextFieldKey,
  PebContextRendererConfigs,
  PebContextRendererType,
  PebContextTree,
  PebCss,
  PebElementType,
  PebIntegrationContextField,
  PebIntegrationDataModels,
  PebIntegrationDataType,
  PebMap,
  PebRenderElementModel,
  PebRenderUpdateModel,
  isContextLink,
  isImage,
  isInternalPage,
} from '@pe/builder/core';

import { evaluate } from '../evaluate';
import { getClonedElementPositionStyles } from '../styles';


const renderConfigResolvers: { [key: string]: ResolverCallback } = {  
  [PebContextRendererType.Image]: getImageUpdate,
  [PebContextRendererType.Link]: getLinkUpdates,
  [PebContextRendererType.Display]: getDisplayUpdates,
  [PebContextRendererType.Text]: getTextUpdate,
  [PebContextRendererType.BackgroundColor]: getColorUpdate,
};

export function getContextRenderUpdates(
  context: PebContextTree,
  contexts: PebMap<PebContextTree>,
  elements: PebMap<PebRenderElementModel>,
): PebRenderUpdateModel[] {
  return getContextRenderUpdatesRecursive({ context, contexts, elements, circularCheck: new Set() }) ?? [];
}

export function getContextRenderUpdatesRecursive(params: ResolverParam): PebRenderUpdateModel[] {
  const updates: PebRenderUpdateModel[] = [];
  const { context, circularCheck } = params;
  const id = context.id ?? '';
  if (circularCheck.has(id)) {
    return [];
  }
  circularCheck.add(id);
  const element = params.elements[id];
  const renderConfigs = params.context?.renderConfigs ?? {};

  renderConfigs.clone !== undefined && updates.push(...getCloneUpdates({ ...params, element }));

  Object.entries(renderConfigs).forEach(([key, config]) => {
    if (config !== undefined) {
      const resolver = renderConfigResolvers[key];
      if (resolver) {
        const configUpdates = resolver({ ...params, element });
        configUpdates?.length && updates.push(...configUpdates);
      }
    }
  });

  context.children?.forEach((childContext) => {
    updates.push(...getContextRenderUpdatesRecursive({ ...params, context: childContext }));
  });

  return updates;
}

function getCloneUpdates(params: ResolverParam): PebRenderUpdateModel[] {
  return getCloneUpdatesRecursive(params) ?? [];
}

function getCloneUpdatesRecursive(params: ResolverParam): PebRenderElementModel[] | undefined {
  const { elements, context } = params;
  const cloneConfig = context.renderConfigs?.clone;
  const originalElementId = cloneConfig?.originalElementId;
  if (!cloneConfig || !originalElementId) {
    return undefined;
  }
  const id = context.id ?? '';
  const existingElement = elements[id];

  const originalElement = elements[originalElementId];
  if (!originalElement) {
    return [];
  }

  const clonedHostStyles: PebCss = getClonedElementPositionStyles(originalElement.style.host, cloneConfig.positioning);
  const cloned: PebRenderElementModel = {
    ...originalElement,
    id,
    style: {
      ...originalElement.style,
      host: {
        ...originalElement.style?.host,
        ...clonedHostStyles,
      },
    },
    parent: { id: cloneConfig.parentElementId },
    children: [],
    origin: { id: originalElement.id },
  };

  elements[cloned.id] = cloned;
  const updates: PebRenderElementModel[] = [cloned];

  if (context.children?.length && !existingElement) {
    context.children.forEach((ctx) => {
      const childUpdates = getCloneUpdatesRecursive({
        ...params,
        context: ctx,
        element: undefined,
      });

      childUpdates !== undefined && updates.push(...childUpdates);
    });
  }

  return updates;
}

function getImageUpdate({ element, context }: ResolverParam): PebRenderUpdateModel[] | undefined {
  const host: Partial<PebCss> = { backgroundImage: context.value ? `url('${context.value}')` : '' };
  if (!element) {
    return undefined;
  }
  const fill = element.fill ?? element.defs?.pebStyles?.[PEB_ROOT_SCREEN_KEY]?.fill;
  if (!isImage(fill)) {
    host.backgroundSize = 'contain';
    host.backgroundPosition = 'center center';
    host.backgroundRepeat = 'no-repeat';
    host.backgroundColor = 'transparent';
  }

  return [{ id: element.id, style: { host } }];
}

function getLinkUpdates({ element, context }: ResolverParam): PebRenderUpdateModel[] | undefined {
  const link = element?.link;
  if (!element || !link) {
    return undefined;
  }

  if (isInternalPage(link) || isContextLink(link)) {
    const linkConfig = context.renderConfigs?.link;
    if (!linkConfig && !link.dynamicParams || !context?.value) {
      return undefined;
    }
    const contextField = evaluate(linkConfig, { context });
    const dynamicParams = evaluate(link.dynamicParams, { context });

    const linkUpdate = { ...element.link, ...contextField, ...dynamicParams };

    return [{ id: element.id, link: linkUpdate }];
  }

  return undefined;
}

function getDisplayUpdates({ element, context }: ResolverParam): PebRenderUpdateModel[] | undefined {
  const config = context.renderConfigs.display;
  if (!config) {
    return;
  }

  const display = config?.hidden
    ? 'none'
    : config.positionType ?? 'block';

  return element && element.style?.host?.display !== display
    ? [{ id: element.id, style: { host: { display } } }]
    : undefined;
}

function getTextUpdate({ element, context }: ResolverParam): PebRenderUpdateModel[] | undefined {
  const text = context.value !== undefined ? context.value : '';

  return element
    ? [{ id: element.id, text: `${text}` }]
    : undefined;
}

function getColorUpdate({ element, context }: ResolverParam): PebRenderUpdateModel[] | undefined {
  if (!element) {
    return undefined;
  }
  const color = context.value !== undefined ? context.value : '';
  const host: Partial<PebCss> = {
    backgroundColor: color ? color : '',
    backgroundImage: undefined,
  };

  return [{ id: element.id, style: { host } }];
}

export function flattenContexts(context: PebContextTree | undefined): PebMap<PebContextTree> {
  if (!context) {
    return {};
  }
  const map: PebMap<PebContextTree> = {};
  flattenContextsRecursive(context, map);

  return map;
}

export function getRenderConfigByDataType(dataType: PebIntegrationDataType | undefined): PebContextRendererConfigs {
  if (!dataType) {
    return {};
  }

  if (dataType === PebIntegrationDataType.ImageUrl) {
    return { image: {} };
  }

  if (dataType === PebIntegrationDataType.Url) {
    return { link: {} };
  }

  if (dataType === PebIntegrationDataType.Color) {
    return { backgroundColor: {} };
  }

  if ([
    PebIntegrationDataType.String,
    PebIntegrationDataType.UUID,
    PebIntegrationDataType.Number,
  ].includes(dataType)) {
    return { text: {} };
  }

  return {};
}

export function extractContextArrayValue(context: PebContext): PebIntegrationDataModels.Array | undefined {
  if (!context.value) {
    return undefined;
  }
  if (context.dataType === PebIntegrationDataType.Table) {
    return (context.value as PebIntegrationDataModels.Table)?.value;
  }
  if (context.dataType === PebIntegrationDataType.Array) {
    return Object.values(context.value ?? {}) as PebIntegrationDataModels.Array;
  }

  return [];
}

export function getDefaultContextField(
  element: { type?: PebElementType; parent?: { type?: PebElementType } },
): PebIntegrationContextField | undefined {
  if (element.type === PebElementType.Grid) {
    return {
      dataType: PebIntegrationDataType.Array,
      eval: PebContextFieldKey.list,
    };
  }

  if (element.parent?.type === PebElementType.Grid) {
    return {
      dataType: PebIntegrationDataType.Object,
      eval: PebContextFieldKey.ListItem,
    };
  }

  return undefined;
}

export function getPatchedDataParam(
  dataParams: PebAPIDataSourceParams | undefined,
  update: Partial<PebAPIDataSourceParams>,
): PebAPIDataSourceParams {
  return {
    filters: { ...dataParams?.filters, ...update.filters },
    pagination: { ...PEB_DEFAULT_PAGINATION, ...dataParams?.pagination, ...update.pagination },
    params: { ...dataParams?.params, ...update.params },
  };

}

function flattenContextsRecursive(context: PebContextTree, map: PebMap<PebContextTree>) {
  map[context.id ?? ''] = context;
  context.children.forEach(ctx => flattenContextsRecursive(ctx, map));
}

type ResolverCallback = (param: ResolverParam) => PebRenderUpdateModel[] | undefined;

interface ResolverParam {
  context: PebContextTree;
  contexts: PebMap<PebContextTree>,  
  elements: PebMap<PebRenderElementModel>;
  element?: PebRenderElementModel | undefined;
  circularCheck: Set<string>;
}

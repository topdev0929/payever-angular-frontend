import https from 'https';

import axios from 'axios';

import { PebPage, PebTheme } from '@pe/builder/core';

import { serverConfig } from './config.service';

const api = axios.create({ httpsAgent: new https.Agent({ keepAlive: true }) });
const config = serverConfig;

export async function getThemeByDomain(domain: string): Promise<PebTheme> {
  const url = `${config.apiUrl}/api/${config.appType}/theme/by-domain?domain=${domain}`;
  const response = await api.get(url);
  const theme = response.data;
  theme.id = theme.themeId;

  return theme;
}

export async function getThemePages(themeId: string, version: number): Promise<PebPage[]> {  
  const url = `${config.builderApiUrl}/api/theme/${themeId}/pages/version/${version}`;
  const pagesResponse = await api.get(url);
  const pages: PebPage[] = pagesResponse.data.filter((p: any) => !p.deleted);

  return pages ?? [];
}
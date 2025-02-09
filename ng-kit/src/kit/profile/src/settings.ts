export interface RestUrlInterface {
  [propName: string]: (param1?: string, param2?: string) => string;
}

export const urls: RestUrlInterface = {
  getProfile: (id: string, prefix: string) => `${prefix}user/${id}`,
  getProfileSettings: (prefix: string) => `${prefix}user/settings`
};

/* eslint-disable */
declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };
/* eslint-enable */

const win = window as Window & { [key: string]: any };

export async function initRemote(
  remoteName: string,
  remoteEntry: string,
) {
  const container = await loadRemoteScript(remoteName, remoteEntry);
  await __webpack_init_sharing__('default');

  return await container.init(__webpack_share_scopes__.default);
}

export async function loadRemoteModule(
  remoteName: string,
  exposedModule = './Module',
): Promise<any> {
  const factory = await win[remoteName].get(exposedModule);

  return await factory();
}

async function loadRemoteScript(remoteName: string, remoteEntry: string): Promise<any> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = remoteEntry;
    script.onload = () => {
      const container = win[remoteName];
      resolve(container);
    };

    document.head.appendChild(script);
  });
}

export const appVersionFactory = () => () => {
  const key = 'pe_version';
  if (localStorage.getItem(key) !== 'MICRO_COMMERCEOS_VERSION') {

    sessionStorage.clear();

    localStorage.clear();
    localStorage.setItem(key, 'MICRO_COMMERCEOS_VERSION');
  }
};


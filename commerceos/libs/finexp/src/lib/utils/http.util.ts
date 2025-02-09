function isStatus200(status: any): boolean {
  return String(status).length === 3 && String(status).substr(0, 1) === '2';
}

export function request(
  path: string, method: 'GET' | 'POST' | 'PATCH',
  withToken: boolean,
  body: any,
  successCallback: (data: any) => void,
  failCallback: (data: string) => void = null
): void {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path, true);
  xhr.responseType = 'json';
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.withCredentials = true;
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (isStatus200(xhr.status)) {
        let parsed = xhr.responseType === '' || xhr.responseType === 'text' ? JSON.parse(xhr.responseText) : xhr.response;
        if (typeof parsed === 'string') {
          // For IE prev code is not parsed
          parsed = JSON.parse(parsed);
        }

        successCallback(parsed);
      } else {
        return failCallback && failCallback(xhr.response?.message || xhr.statusText);
      }
    }
  };
  xhr.onerror = () => {
    return failCallback && failCallback(xhr.response?.message || xhr.statusText);
  };
  try {
    xhr.send(body ? JSON.stringify(body) : null);
  } catch (error) {
    return failCallback && failCallback(error.toString());
  }
}

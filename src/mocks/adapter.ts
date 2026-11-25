import { AxiosError, type AxiosAdapter, type AxiosResponse } from 'axios';

import { mockHandlers, type MockRequest } from './handlers';

const MOCK_LATENCY_MS = 600;

function matchHandler(method: string, url: string) {
  const path = url.split('?')[0];
  for (const [key, handler] of Object.entries(mockHandlers)) {
    const [handlerMethod, template] = key.split(' ');
    if (handlerMethod !== method) continue;
    const names: string[] = [];
    const pattern = template.replace(/:(\w+)/g, (_, name: string) => {
      names.push(name);
      return '([^/]+)';
    });
    const match = new RegExp(`^${pattern}$`).exec(path);
    if (match) {
      const params = Object.fromEntries(names.map((n, i) => [n, decodeURIComponent(match[i + 1])]));
      return { handler, params };
    }
  }
  return null;
}

/** Axios adapter that answers requests from src/mocks instead of the network. */
export const mockAdapter: AxiosAdapter = async (config) => {
  const method = (config.method ?? 'get').toUpperCase();
  const url = config.url ?? '';
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));

  const matched = matchHandler(method, url);
  const req: MockRequest = {
    body: typeof config.data === 'string' ? JSON.parse(config.data) : (config.data ?? {}),
    params: matched?.params ?? {},
    query: config.params ?? {},
    authorization: config.headers?.Authorization?.toString(),
  };
  const result = matched
    ? matched.handler(req)
    : {
        status: 404,
        data: { message: `No mock defined for ${method} ${url}` },
      };

  const response: AxiosResponse = {
    data: result.data,
    status: result.status,
    statusText: String(result.status),
    headers: {},
    config,
    request: {},
  };

  if (result.status >= 400) {
    throw new AxiosError(
      `Request failed with status code ${result.status}`,
      result.status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST,
      config,
      response.request,
      response,
    );
  }
  return response;
};

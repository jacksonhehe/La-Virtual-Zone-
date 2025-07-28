// Lightweight fetch-based client to avoid axios dependency
// Drop-in-ish replacement for simple use cases: api.get(url, { params }), api.post(url, body)
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

type Dict = Record<string, any>;

type GetConfig = { params?: Dict };
type MutateConfig = { headers?: Record<string, string> };

const buildQS = (params?: Dict) => {
  if (!params) return '';
  const qp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qp.set(k, String(v));
  });
  const s = qp.toString();
  return s ? `?${s}` : '';
};

async function request<T>(url: string, init: RequestInit & { params?: Dict } = {}): Promise<T> {
  const { params, ...rest } = init;
  const finalUrl = `${BASE_URL}${url}${buildQS(params)}`;

  const headers = new Headers(rest.headers || {});
  const isForm = rest.body instanceof FormData;
  if (!isForm && rest.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(finalUrl, {
    credentials: 'include',
    ...rest,
    headers,
    body: isForm ? rest.body : (rest.body ? JSON.stringify(rest.body) : undefined),
  });

  if (!res.ok) {
    let detail = '';
    try { detail = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status} ${res.statusText}${detail ? ` - ${detail}` : ''}`);
  }

  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return (await res.json()) as T;
  // @ts-ignore
  return (await res.text()) as T;
}

export const api = {
  get: <T>(url: string, config?: GetConfig) => request<T>(url, { method: 'GET', params: config?.params }),
  post: <T>(url: string, body?: any, config?: MutateConfig) => request<T>(url, { method: 'POST', body, headers: config?.headers }),
  put: <T>(url: string, body?: any, config?: MutateConfig) => request<T>(url, { method: 'PUT', body, headers: config?.headers }),
  patch: <T>(url: string, body?: any, config?: MutateConfig) => request<T>(url, { method: 'PATCH', body, headers: config?.headers }),
  delete: <T>(url: string, config?: MutateConfig) => request<T>(url, { method: 'DELETE', headers: config?.headers }),
};

export default api;

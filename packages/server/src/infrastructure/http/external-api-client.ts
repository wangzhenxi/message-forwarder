import { config } from '../../config';

/**
 * 外部 HTTP 接口客户端，基础地址由 config.externalApiBaseUrl 配置
 */
export class ExternalApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = config.externalApiBaseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private async request<T>(
    path: string,
    options: RequestInit & { method?: string; body?: unknown } = {}
  ): Promise<T> {
    const { method = 'GET', body, headers: customHeaders, ...rest } = options;
    const url = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(customHeaders as Record<string, string>),
    };
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      ...rest,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`External API ${method} ${path} failed: ${res.status} ${text}`);
    }
    const contentType = res.headers.get('content-type');
    if (contentType?.includes('application/json')) return res.json() as Promise<T>;
    return res.text() as unknown as T;
  }

  async get<T>(path: string, headers?: RequestInit['headers']): Promise<T> {
    return this.request<T>(path, { method: 'GET', headers });
  }

  async post<T>(path: string, body?: unknown, headers?: RequestInit['headers']): Promise<T> {
    return this.request<T>(path, { method: 'POST', body: body ?? {}, headers });
  }

  async put<T>(path: string, body?: unknown, headers?: RequestInit['headers']): Promise<T> {
    return this.request<T>(path, { method: 'PUT', body: body ?? {}, headers });
  }

  async delete<T>(path: string, headers?: RequestInit['headers']): Promise<T> {
    return this.request<T>(path, { method: 'DELETE', headers });
  }
}

export const externalApiClient = new ExternalApiClient();

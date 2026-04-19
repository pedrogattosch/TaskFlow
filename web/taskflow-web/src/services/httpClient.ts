type HttpErrorBody = {
  detail?: string;
  title?: string;
};

export class HttpClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'HttpClientError';
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api';

type RequestOptions = {
  accessToken?: string;
};

export async function postJson<TResponse, TBody>(
  path: string,
  body: TBody,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      ...buildHeaders(options),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new HttpClientError(
      errorBody.detail ?? errorBody.title ?? 'Não foi possível concluir a solicitação.',
      response.status,
    );
  }

  if (response.status === 204) {
    return null as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export async function patchJson<TResponse, TBody>(
  path: string,
  body: TBody,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PATCH',
    headers: {
      ...buildHeaders(options),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new HttpClientError(
      errorBody.detail ?? errorBody.title ?? 'Não foi possível concluir a solicitação.',
      response.status,
    );
  }

  return response.json() as Promise<TResponse>;
}

export async function putJson<TResponse, TBody>(
  path: string,
  body: TBody,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'PUT',
    headers: {
      ...buildHeaders(options),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new HttpClientError(
      errorBody.detail ?? errorBody.title ?? 'Não foi possível concluir a solicitação.',
      response.status,
    );
  }

  return response.json() as Promise<TResponse>;
}

export async function deleteJson(
  path: string,
  options: RequestOptions = {},
): Promise<void> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new HttpClientError(
      errorBody.detail ?? errorBody.title ?? 'Não foi possível concluir a solicitação.',
      response.status,
    );
  }
}

export async function getJson<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'GET',
    headers: buildHeaders(options),
  });

  if (!response.ok) {
    const errorBody = await readErrorBody(response);
    throw new HttpClientError(
      errorBody.detail ?? errorBody.title ?? 'Não foi possível carregar os dados.',
      response.status,
    );
  }

  return response.json() as Promise<TResponse>;
}

function buildHeaders(options: RequestOptions) {
  const headers: HeadersInit = {};

  if (options.accessToken) {
    headers.Authorization = `Bearer ${options.accessToken}`;
  }

  return headers;
}

async function readErrorBody(response: Response): Promise<HttpErrorBody> {
  try {
    return (await response.json()) as HttpErrorBody;
  } catch {
    return {};
  }
}

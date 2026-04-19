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

export async function postJson<TResponse, TBody>(path: string, body: TBody): Promise<TResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
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

async function readErrorBody(response: Response): Promise<HttpErrorBody> {
  try {
    return (await response.json()) as HttpErrorBody;
  } catch {
    return {};
  }
}

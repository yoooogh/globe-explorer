class ApiError extends Error {
  statusCode: number | null;
  originalUrl: string;

  constructor(
    message: string,
    statusCode: number | null,
    originalUrl: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.originalUrl = originalUrl;
  }
}

const DEFAULT_TIMEOUT_MS = 10_000;

export async function httpGet<T>(
  url: string,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  headers?: Record<string, string>,
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: headers || {},
    });

    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        url,
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if ((error as Error).name === 'AbortError') {
      throw new ApiError(`请求超时 (${timeoutMs / 1000}秒)`, null, url);
    }
    throw new ApiError((error as Error).message, null, url);
  } finally {
    clearTimeout(timeoutId);
  }
}

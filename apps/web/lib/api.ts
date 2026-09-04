import { API_URL } from "../lib/config";

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  const auth = localStorage.getItem("auth");

  if (!auth) {
    return null;
  }

  try {
    const { accessToken } = JSON.parse(auth);

    return accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Helper interno para parsear JSON de forma segura.
 * Maneja respuestas vacías como las de 204 No Content.
 */
async function parseJsonSafely(
  response: Response,
) {
  const text = await response.text();

  return text ? JSON.parse(text) : null;
}

function getHeaders(
  isFormData = false,
): HeadersInit {
  const token = getAccessToken();

  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers["Content-Type"] =
      "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export async function post<T = unknown>(
  url: string,
  data: unknown,
): Promise<T> {
  const isFormData = data instanceof FormData;

  const response = await fetch(
    `${API_URL}${url}`,
    {
      method: "POST",
      headers: getHeaders(isFormData),
      body: isFormData
        ? data
        : JSON.stringify(data),
    },
  );

  const result =
    await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error en la petición",
    );
  }

  return result as T;
}

export async function postForm<T = unknown>(
  url: string,
  data: FormData,
): Promise<T> {
  return post<T>(url, data);
}

export async function put<T = unknown>(
  url: string,
  data: unknown,
): Promise<T> {
  const isFormData = data instanceof FormData;

  const response = await fetch(`${API_URL}${url}`, {
    method: "PUT",
    headers: getHeaders(isFormData),
    body: isFormData
      ? data
      : JSON.stringify(data),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error en la petición",
    );
  }

  return result as T;
}

export async function get<T = unknown>(
  url: string,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${url}`,
    {
      headers: getHeaders(),
    },
  );

  const result =
    await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error en la petición",
    );
  }

  return result as T;
}

export async function patchForm<T = unknown>(
  url: string,
  data: FormData,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${url}`,
    {
      method: "PATCH",
      headers: getHeaders(true),
      body: data,
    },
  );

  const result =
    await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error en la petición",
    );
  }

  return result as T;
}

export async function del<T = unknown>(
  url: string,
): Promise<T> {
  const response = await fetch(
    `${API_URL}${url}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  const result =
    await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error al eliminar el recurso",
    );
  }

  return result as T;
}

export async function patch<T = unknown>(
  url: string,
  data: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}${url}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  const result = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(
      result?.message ||
        "Error en la petición",
    );
  }

  return result as T;
}
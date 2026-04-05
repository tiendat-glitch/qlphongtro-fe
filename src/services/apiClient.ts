import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

type ApiClientOptions = RequestInit & {
  requireAuth?: boolean;
  redirectOnAuthFailure?: boolean;
};

type ApiResponseBody = {
  message?: string;
  data?: unknown;
};

const normalizeText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();

const isAuthFailure = (status: number, message: string) => {
  const normalized = normalizeText(message || '');
  if (status === 401) return true;
  if (!normalized.includes('token')) return false;
  return (
    normalized.includes('khong hop le') ||
    normalized.includes('het han') ||
    normalized.includes('missing token') ||
    normalized.includes('invalid')
  );
};

const clearAuthState = async () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('khachThueToken');
    localStorage.removeItem('khachThueData');
  }

  try {
    await signOut({ redirect: false });
  } catch {
    // ignore signOut failure
  }
};

const redirectIfPrivateRoute = () => {
  if (typeof window === 'undefined') return;

  const { pathname } = window.location;
  const isKhachThuePrivate = pathname.startsWith('/khach-thue/dashboard');
  const isDashboardPrivate = pathname.startsWith('/dashboard');
  if (!isKhachThuePrivate && !isDashboardPrivate) return;

  const loginPath = isKhachThuePrivate ? '/khach-thue/dang-nhap' : '/dang-nhap';
  if (pathname !== loginPath) {
    window.location.replace(loginPath);
  }
};

/**
 * Ham goi API chung cho frontend sang backend Node.js.
 */
export async function apiClient<T>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const {
    requireAuth = true,
    redirectOnAuthFailure = requireAuth,
    ...requestOptions
  } = options;

  let token: string | null = null;
  if (requireAuth) {
    const session = await getSession();
    const sessionToken = session?.user?.token;
    const khachThueToken =
      typeof window !== 'undefined' ? localStorage.getItem('khachThueToken') : null;
    token = sessionToken || khachThueToken || null;
  }

  const headers = new Headers(requestOptions.headers);
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth && token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...requestOptions,
    headers,
  });

  const rawBody = await response.text();
  let responseData: ApiResponseBody | null = null;
  if (rawBody) {
    try {
      const parsed: unknown = JSON.parse(rawBody);
      if (parsed && typeof parsed === 'object') {
        responseData = parsed as ApiResponseBody;
      } else {
        responseData = { data: parsed };
      }
    } catch {
      responseData = { message: rawBody };
    }
  }

  if (!response.ok) {
    const message =
      responseData?.message ||
      response.statusText ||
      `Yeu cau that bai (${response.status})`;

    if (isAuthFailure(response.status, message)) {
      await clearAuthState();
      if (redirectOnAuthFailure) {
        redirectIfPrivateRoute();
      }
      throw new Error('Phien dang nhap khong hop le hoac da het han. Vui long dang nhap lai.');
    }

    throw new Error(message);
  }

  return (responseData?.data ?? responseData) as T;
}

export const fetcher = (url: string) => apiClient(url);

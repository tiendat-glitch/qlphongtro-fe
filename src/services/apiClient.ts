import { getSession } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Hàm gọi API chung cho toàn bộ dự án thay thế việc gọi trực tiếp /api/...
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const session = await getSession();
  const sessionToken = session?.user?.token;
  const khachThueToken = typeof window !== 'undefined' ? localStorage.getItem('khachThueToken') : null;
  const token = sessionToken || khachThueToken;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Chỉ tự động thêm token nếu trong options.headers chưa có Authorization
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Lỗi kết nối tới máy chủ');
  }

  return responseData.data; // Backend chuẩn hóa trả về { success, message, data }
}

export const fetcher = (url: string) => apiClient(url);

import { apiClient } from './apiClient';

export interface UserProfile {
  _id: string; // Chuyển đổi từ id
  name: string; // Chuyển đổi từ ten
  email: string;
  phone?: string; // Chuyển đổi từ soDienThoai
  address?: string; // Chuyển đổi từ diaChi
  avatar?: string; // Chuyển đổi từ anhDaiDien
  role: string; // Chuyển đổi từ vaiTro
  createdAt: string; // Chuyển đổi từ ngayTao
  lastLogin?: string;
  trangThai?: string;
}

const mapBackendToFrontend = (data: any): UserProfile => {
  return {
    _id: data.id?.toString() || '',
    name: data.ten || '',
    email: data.email || '',
    phone: data.soDienThoai || '',
    address: data.diaChi || '',
    avatar: data.anhDaiDien || '',
    role: data.vaiTro || '',
    createdAt: data.ngayTao || '',
    lastLogin: data.lastLogin || '',
    trangThai: data.trangThai || ''
  };
};

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const data = await apiClient<any>('/users/me');
    return mapBackendToFrontend(data);
  },

  updateProfile: async (payload: {
    name: string;
    phone: string;
    address: string;
    avatar: string;
  }): Promise<UserProfile> => {
    const data = await apiClient<any>('/users/me', {
      method: 'PUT',
      body: JSON.stringify({
        ten: payload.name,
        soDienThoai: payload.phone,
        diaChi: payload.address,
        anhDaiDien: payload.avatar
      })
    });
    return mapBackendToFrontend(data);
  },

  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await apiClient<any>('/users');
    // Trả về { success: true, data: [...] }
    const users = response.data || [];
    return users.map(mapBackendToFrontend);
  },

  adminCreateUser: async (payload: any): Promise<UserProfile> => {
    const data = await apiClient<any>('/users', {
      method: 'POST',
      body: JSON.stringify({
        ten: payload.name,
        email: payload.email,
        matKhau: payload.password,
        soDienThoai: payload.phone,
        vaiTro: payload.role,
        trangThai: payload.trangThai || 'hoatDong'
      })
    });
    return mapBackendToFrontend(data.data);
  },

  adminUpdateUser: async (id: string, payload: any): Promise<UserProfile> => {
    const data = await apiClient<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ten: payload.name,
        email: payload.email,
        matKhau: payload.password, // Nếu có
        soDienThoai: payload.phone,
        vaiTro: payload.role,
        trangThai: payload.trangThai
      })
    });
    return mapBackendToFrontend(data.data);
  },

  adminDeleteUser: async (id: string): Promise<boolean> => {
    const response = await apiClient<any>(`/users/${id}`, {
      method: 'DELETE'
    });
    return response.success;
  }
};

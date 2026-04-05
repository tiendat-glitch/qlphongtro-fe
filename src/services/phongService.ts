import { apiClient } from './apiClient';
import { Phong } from '@/types';
import { getSession } from 'next-auth/react';

const buildQueryString = (filters?: any) => {
    let queryStr = '';
    if (filters) {
        const query = new URLSearchParams(filters).toString();
        if (query) queryStr = `?${query}`;
    }
    return queryStr;
};

const mapPhongList = (data: any[]) =>
    data.map(item => ({
        ...item,
        _id: item?._id?.toString?.() || item?.id?.toString?.()
    })) as Phong[];

const getAuthToken = async () => {
    const session = await getSession().catch(() => null);
    const sessionToken = session?.user?.token;
    const khachThueToken = typeof window !== 'undefined' ? localStorage.getItem('khachThueToken') : null;
    return sessionToken || khachThueToken || null;
};

const tryGetPrivatePhong = async (queryStr: string) => {
    const token = await getAuthToken();
    if (!token) return [];

    const privateData = await apiClient<any[]>('/phong' + queryStr, {
        requireAuth: false,
        redirectOnAuthFailure: false,
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return mapPhongList(privateData || []);
};

export const phongService = {
    getAll: async (filters?: any) => {
        const queryStr = buildQueryString(filters);
        const data = await apiClient<any[]>('/phong' + queryStr);
        return mapPhongList(data);
    },

    getPublicAll: async (filters?: any) => {
        const queryStr = buildQueryString(filters);

        try {
            const data = await apiClient<any[]>('/public/phong' + queryStr, {
                requireAuth: false,
                redirectOnAuthFailure: false
            });
            const publicMapped = mapPhongList(data || []);

            if (publicMapped.length > 0) {
                return publicMapped;
            }

            try {
                const privateMapped = await tryGetPrivatePhong(queryStr);
                if (privateMapped.length > 0) {
                    return privateMapped;
                }
            } catch {
                // Ignore private fallback errors for truly public/unauthenticated access.
            }

            return publicMapped;
        } catch (error) {
            if (error instanceof Error) {
                const normalized = error.message.toLowerCase();
                if (normalized.includes('cannot get /api/public/phong') || normalized.includes('(404)')) {
                    try {
                        return await tryGetPrivatePhong(queryStr);
                    } catch {
                        throw new Error('Backend chua ho tro GET /api/public/phong cho trang public /xem-phong.');
                    }
                }
            }
            throw error;
        }
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/phong/${id}`);
        return { ...data, _id: data.id.toString() } as Phong;
    },

    create: async (data: Partial<Phong>) => {
        const res = await apiClient<any>('/phong', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as Phong;
    },

    update: async (id: number | string, data: Partial<Phong>) => {
        const res = await apiClient<any>(`/phong/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
        return { ...res, _id: res.id.toString() } as Phong;
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/phong/${id}`, {
            method: 'DELETE',
        });
    }
};

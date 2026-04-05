import { apiClient } from './apiClient';
import { ThanhToan } from '@/types';

type RawThanhToan = Partial<ThanhToan> & {
    id?: number | string;
    hoaDon_id?: number | string | null;
    nguoiNhan_id?: number | string | null;
    maHoaDon?: string | null;
    maPhong?: string | null;
    tenNguoiDaiDien?: string | null;
    hoTen?: string | null;
    tenNguoiNhan?: string | null;
    thongTinChuyenKhoan_nganHang?: string | null;
    thongTinChuyenKhoan_soGiaoDich?: string | null;
};

const toStringId = (value: unknown) => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    return '';
};

const toDateValue = (value: unknown) => {
    if (!value) return new Date();
    const date = new Date(value as string | number | Date);
    return Number.isNaN(date.getTime()) ? new Date() : date;
};

const getRefId = (value: unknown) => {
    if (typeof value === 'string' || typeof value === 'number') {
        return value.toString();
    }
    if (value && typeof value === 'object' && '_id' in value) {
        return toStringId((value as { _id?: unknown })._id);
    }
    return '';
};

const normalizeThanhToan = (item: RawThanhToan): ThanhToan => {
    const rawHoaDon = item.hoaDon ?? item.hoaDon_id;
    const normalizedHoaDon = rawHoaDon && typeof rawHoaDon === 'object'
        ? rawHoaDon
        : toStringId(rawHoaDon);

    const nganHang =
        item.thongTinChuyenKhoan?.nganHang ?? item.thongTinChuyenKhoan_nganHang ?? '';
    const soGiaoDich =
        item.thongTinChuyenKhoan?.soGiaoDich ?? item.thongTinChuyenKhoan_soGiaoDich ?? '';

    const hasTransferInfo = Boolean(nganHang || soGiaoDich);
    const hoaDonObject = normalizedHoaDon && typeof normalizedHoaDon === 'object'
        ? (normalizedHoaDon as Record<string, any>)
        : null;

    return {
        ...item,
        _id: toStringId(item._id || item.id),
        hoaDon: normalizedHoaDon as ThanhToan['hoaDon'],
        nguoiNhan: getRefId(item.nguoiNhan ?? item.nguoiNhan_id),
        thongTinChuyenKhoan: hasTransferInfo ? { nganHang, soGiaoDich } : undefined,
        maHoaDon: item.maHoaDon ?? hoaDonObject?.maHoaDon,
        maPhong: item.maPhong ?? hoaDonObject?.maPhong ?? hoaDonObject?.phong?.maPhong,
        tenNguoiDaiDien: item.tenNguoiDaiDien ?? item.hoTen ?? hoaDonObject?.khachThue?.hoTen,
        hoTen: item.hoTen ?? item.tenNguoiDaiDien ?? hoaDonObject?.khachThue?.hoTen,
        tenNguoiNhan: item.tenNguoiNhan,
        thongTinChuyenKhoan_nganHang: item.thongTinChuyenKhoan_nganHang ?? (nganHang || null),
        thongTinChuyenKhoan_soGiaoDich: item.thongTinChuyenKhoan_soGiaoDich ?? (soGiaoDich || null),
        ngayThanhToan: toDateValue(item.ngayThanhToan),
        ngayTao: toDateValue(item.ngayTao),
    } as ThanhToan;
};

export const thanhToanService = {
    getAll: async (filters?: any) => {
        let queryStr = '';
        if (filters) {
            const query = new URLSearchParams(filters).toString();
            if (query) queryStr = `?${query}`;
        }
        const data = await apiClient<any[]>('/thanh-toan' + queryStr);
        return data.map(item => normalizeThanhToan(item));
    },

    getById: async (id: number | string) => {
        const data = await apiClient<any>(`/thanh-toan/${id}`);
        return normalizeThanhToan(data);
    },

    create: async (data: Partial<ThanhToan>) => {
        const res = await apiClient<{thanhToan: any, hoaDon: any}>('/thanh-toan', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        return {
            thanhToan: normalizeThanhToan(res.thanhToan),
            hoaDon: { ...res.hoaDon, _id: res.hoaDon?.id?.toString() }
        };
    },

    delete: async (id: number | string) => {
        return apiClient<any>(`/thanh-toan/${id}`, {
            method: 'DELETE',
        });
    }
};

import { useSession } from 'next-auth/react';

/**
 * Hook để kiểm tra quyền của người dùng hiện tại.
 * - admin: toàn quyền
 * - chuNha: đầy đủ quyền vận hành, không thể quản lý admin khác
 * - nhanVien: không được xóa dữ liệu quan trọng (tòa nhà, phòng, khách thuê, hợp đồng, hóa đơn)
 */
export function usePermissions() {
  const { data: session } = useSession();
  const role = session?.user?.role as string | undefined;

  const isAdmin = role === 'admin';
  const isChuNha = role === 'chuNha';
  const isNhanVien = role === 'nhanVien';

  /**
   * Kiểm tra xem người dùng hiện tại có thể xóa các bản ghi quan trọng không.
   * Nhân viên KHÔNG được phép xóa.
   */
  const canDelete = isAdmin || isChuNha;

  return {
    role,
    isAdmin,
    isChuNha,
    isNhanVien,
    canDelete,
  };
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, User, CreditCard, Loader2 } from 'lucide-react';
import { KhachThue } from '@/types';
import { khachThueService } from '@/services/khachThueService';
import { CCCDUpload } from '@/components/ui/cccd-upload';
import { toast } from 'sonner';

export default function ThongTinCaNhanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    hoTen: '',
    soDienThoai: '',
    email: '',
    cccd: '',
    ngaySinh: '',
    gioiTinh: 'nam',
    queQuan: '',
    ngheNghiep: '',
    anhCCCD: {
      matTruoc: '',
      matSau: '',
    },
    matKhau: '',
  });

  useEffect(() => {
    document.title = 'Thông tin cá nhân | Khách thuê';
    const storedToken = localStorage.getItem('khachThueToken');
    if (!storedToken) {
      router.push('/khach-thue/dang-nhap');
      return;
    }
    setToken(storedToken);
    fetchData(storedToken);
  }, [router]);

  const fetchData = async (authToken: string) => {
    try {
      setLoading(true);
      const res = await khachThueService.me(authToken);
      if (res && res.khachThue) {
        const kt = res.khachThue;
        setFormData({
          hoTen: kt.hoTen || '',
          soDienThoai: kt.soDienThoai || '',
          email: kt.email || '',
          cccd: kt.cccd || '',
          ngaySinh: kt.ngaySinh ? new Date(kt.ngaySinh).toISOString().split('T')[0] : '',
          gioiTinh: kt.gioiTinh || 'nam',
          queQuan: kt.queQuan || '',
          ngheNghiep: kt.ngheNghiep || '',
          anhCCCD: {
            matTruoc: kt.anhCCCD_matTruoc || '',
            matSau: kt.anhCCCD_matSau || '',
          },
          matKhau: '',
        });
        
        // Update local storage data to keep sidebar in sync
        const currentDataStr = localStorage.getItem('khachThueData');
        if (currentDataStr) {
          const currentData = JSON.parse(currentDataStr);
          localStorage.setItem('khachThueData', JSON.stringify({
            ...currentData,
            hoTen: kt.hoTen,
            soDienThoai: kt.soDienThoai
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching personal info:', error);
      toast.error('Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    setSubmitting(true);
    try {
      const submitData: any = { 
        ...formData,
        anhCCCD_matTruoc: formData.anhCCCD.matTruoc,
        anhCCCD_matSau: formData.anhCCCD.matSau
      };
      delete submitData.anhCCCD;
      
      if (!submitData.matKhau) {
        delete submitData.matKhau;
      }

      await khachThueService.updateMe(token, submitData);
      
      toast.success('Cập nhật thông tin thành công!');
      
      // Cập nhật lại cache/localStorage
      const currentDataStr = localStorage.getItem('khachThueData');
      if (currentDataStr) {
        const currentData = JSON.parse(currentDataStr);
        localStorage.setItem('khachThueData', JSON.stringify({
          ...currentData,
          hoTen: formData.hoTen,
          soDienThoai: formData.soDienThoai
        }));
      }
      
      setFormData(prev => ({ ...prev, matKhau: '' })); // Xóa ô mật khẩu sau khi lưu
      
      // Dispatch sự kiện để layout cập nhật (tùy chọn)
      window.dispatchEvent(new Event('storage'));
      
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thông tin cá nhân</h1>
        <p className="text-sm text-gray-600">Quản lý và cập nhật thông tin tài khoản của bạn</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cập nhật thông tin</CardTitle>
          <CardDescription>
            Đảm bảo thông tin của bạn luôn chính xác để ban quản lý có thể liên hệ khi cần.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="thong-tin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="thong-tin" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Thông tin chung</span>
                </TabsTrigger>
                <TabsTrigger value="anh-cccd" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Ảnh CCCD</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="thong-tin" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hoTen">Họ và tên</Label>
                    <Input
                      id="hoTen"
                      value={formData.hoTen}
                      onChange={(e) => setFormData(prev => ({ ...prev, hoTen: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="soDienThoai">Số điện thoại</Label>
                    <Input
                      id="soDienThoai"
                      value={formData.soDienThoai}
                      onChange={(e) => setFormData(prev => ({ ...prev, soDienThoai: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cccd">Số CCCD / CMND</Label>
                    <Input
                      id="cccd"
                      value={formData.cccd}
                      onChange={(e) => setFormData(prev => ({ ...prev, cccd: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ngaySinh">Ngày sinh</Label>
                    <Input
                      id="ngaySinh"
                      type="date"
                      value={formData.ngaySinh}
                      onChange={(e) => setFormData(prev => ({ ...prev, ngaySinh: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="gioiTinh">Giới tính</Label>
                    <Select 
                      value={formData.gioiTinh} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, gioiTinh: value as 'nam' | 'nu' | 'khac' }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nam">Nam</SelectItem>
                        <SelectItem value="nu">Nữ</SelectItem>
                        <SelectItem value="khac">Khác</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="queQuan">Quê quán (Địa chỉ thường trú)</Label>
                  <Input
                    id="queQuan"
                    value={formData.queQuan}
                    onChange={(e) => setFormData(prev => ({ ...prev, queQuan: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ngheNghiep">Nghề nghiệp</Label>
                  <Input
                    id="ngheNghiep"
                    value={formData.ngheNghiep}
                    onChange={(e) => setFormData(prev => ({ ...prev, ngheNghiep: e.target.value }))}
                  />
                </div>

                <div className="space-y-2 pt-4 border-t mt-4">
                  <Label htmlFor="matKhau">Đổi mật khẩu (Tùy chọn)</Label>
                  <Input
                    id="matKhau"
                    type="password"
                    value={formData.matKhau}
                    onChange={(e) => setFormData(prev => ({ ...prev, matKhau: e.target.value }))}
                    placeholder="Để trống nếu không muốn thay đổi"
                  />
                  <p className="text-xs text-gray-500">
                    Nhập mật khẩu mới nếu bạn muốn thay đổi mật khẩu đăng nhập.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="anh-cccd" className="space-y-6 mt-6">
                <div className="bg-blue-50 text-blue-800 p-4 rounded-md text-sm mb-4">
                  Việc tải lên ảnh mặt trước và mặt sau CCCD giúp ban quản lý hoàn thiện hồ sơ lưu trú theo đúng quy định.
                </div>
                <CCCDUpload
                  anhCCCD={formData.anhCCCD}
                  onCCCDChange={(anhCCCD) => setFormData(prev => ({ ...prev, anhCCCD }))}
                  className="w-full"
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end pt-6 border-t">
              <Button type="submit" disabled={submitting} className="min-w-[120px]">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

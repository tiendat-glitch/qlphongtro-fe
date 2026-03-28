export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
}

export async function uploadImageToCloudinary(file: File): Promise<CloudinaryUploadResult> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Chi duoc upload file anh');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Kich thuoc file khong duoc vuot qua 10MB');
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUD_NAME || 'duv9pccwi';
  const uploadPreset = process.env.NEXT_PUBLIC_UPLOAD_PRESET || 'poalupload';

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message || 'Upload that bai');
  }

  return {
    public_id: result.public_id,
    secure_url: result.secure_url,
    width: result.width,
    height: result.height,
  };
}

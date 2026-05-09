// modules/backup/api/index.ts
import api from '@/lib/axios';

export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
  downloadUrl: string;
}

export const createBackup = async (): Promise<{ success: boolean; filename: string; downloadUrl: string }> => {
  const res = await api.post('/backup/create');
  return res.data;
};

export const listBackups = async (): Promise<BackupFile[]> => {
  const res = await api.get('/backup/list');
  return res.data;
};

export const deleteBackup = async (filename: string): Promise<void> => {
  await api.delete(`/backup/${filename}`);
};

// Note: downloadBackup function removed - now using handleDownload with fetch
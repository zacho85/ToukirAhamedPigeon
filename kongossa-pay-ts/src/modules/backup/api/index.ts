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

export const downloadBackup = (filename: string): string => {
  return `${import.meta.env.VITE_APP_API_URL}/backup/download/${filename}`;
};
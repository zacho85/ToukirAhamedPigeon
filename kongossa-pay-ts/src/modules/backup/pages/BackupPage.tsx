// modules/backup/pages/BackupPage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Database, RefreshCw } from 'lucide-react';
import { createBackup, listBackups, deleteBackup, type BackupFile } from '../api';
import { dispatchShowToast } from '@/lib/dispatch';
import { format } from 'date-fns';
import Breadcrumb from '@/components/module/admin/layout/Breadcrumb';
import { useAppSelector } from '@/hooks/useRedux';

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  
  // ✅ Get token from Redux store
  const accessToken = useAppSelector((state) => state.auth.accessToken);

  const loadBackups = async () => {
    setIsLoading(true);
    try {
      const data = await listBackups();
      setBackups(data);
    } catch (error) {
      console.error('Failed to load backups:', error);
      dispatchShowToast({ type: 'danger', message: 'Failed to load backups' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsCreating(true);
    try {
      const result = await createBackup();
      dispatchShowToast({ type: 'success', message: `Backup created: ${result.filename}` });
      await loadBackups();
      
      // Auto download after creation using authenticated fetch
      await handleDownload(result.filename);
    } catch (error: any) {
      dispatchShowToast({ type: 'danger', message: error.response?.data?.message || 'Failed to create backup' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDownload = async (filename: string) => {
    setDownloading(filename);
    try {
      // ✅ Use token from Redux
      if (!accessToken) {
        dispatchShowToast({ type: 'danger', message: 'Not authenticated. Please log in again.' });
        return;
      }

      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const response = await fetch(`${apiUrl}/backup/download/${filename}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          dispatchShowToast({ type: 'danger', message: 'Session expired. Please refresh the page.' });
          return;
        }
        const error = await response.json();
        throw new Error(error.message || 'Download failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      dispatchShowToast({ type: 'success', message: 'Download started' });
    } catch (error: any) {
      console.error('Download failed:', error);
      dispatchShowToast({ type: 'danger', message: error.message || 'Failed to download backup' });
    } finally {
      setDownloading(null);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Delete backup "${filename}"? This action cannot be undone.`)) return;
    
    try {
      await deleteBackup(filename);
      dispatchShowToast({ type: 'success', message: 'Backup deleted successfully' });
      loadBackups();
    } catch (error) {
      dispatchShowToast({ type: 'danger', message: 'Failed to delete backup' });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  useEffect(() => {
    loadBackups();
  }, []);

  const breadcrumbs = [
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Database Backup' },
  ];

  return (
    <div className="p-6">
      <Breadcrumb items={breadcrumbs} title="Database Backup" />

      <div className="max-w-6xl mx-auto">
        {/* Create Backup Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Manual Database Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Create a full database backup. The backup file will be saved on the server and can be downloaded.
            </p>
            <Button onClick={handleCreateBackup} disabled={isCreating}>
              {isCreating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Backup...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Backups List Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Available Backups</span>
              <Button variant="outline" size="sm" onClick={loadBackups} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading backups...</div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No backups found. Create your first backup.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.filename}>
                      <TableCell className="font-mono text-sm">{backup.filename}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{formatFileSize(backup.size)}</Badge>
                      </TableCell>
                      <TableCell>{format(new Date(backup.createdAt), 'PPpp')}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownload(backup.filename)}
                          disabled={downloading === backup.filename}
                        >
                          {downloading === backup.filename ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBackup(backup.filename)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
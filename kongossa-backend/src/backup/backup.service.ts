// kongossa-backend/src/backup/backup.service.ts
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// ✅ Export this interface so it can be used in the controller
export interface BackupFile {
  filename: string;
  size: number;
  createdAt: Date;
  downloadUrl: string;
}

@Injectable()
export class BackupService {
  private backupDir = '/app/backups';

  constructor(private prisma: PrismaService) {}

  async createBackup(userId: number, userRole: string) {
    // Only superadmin can create backups
    if (userRole !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can create backups');
    }

    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_${timestamp}.sql`;
    const filepath = path.join(this.backupDir, filename);

    // Get database URL from environment
    const databaseUrl = process.env.DATABASE_URL;
    const dbName = databaseUrl?.split('/').pop()?.split('?')[0] || 'kongossa_db';
    const host = databaseUrl?.split('@')[1]?.split(':')[0] || 'postgres';
    const user = databaseUrl?.split('://')[1]?.split(':')[0] || 'kongossa_user';
    const password = databaseUrl?.split(':')[2]?.split('@')[0];

    process.env.PGPASSWORD = password;

    try {
      const command = `pg_dump -h ${host} -U ${user} -d ${dbName} --no-owner --no-privileges > ${filepath}`;
      await execAsync(command, { shell: '/bin/bash' });

      const stats = fs.statSync(filepath);

      return {
        success: true,
        filename,
        filepath,
        size: stats.size,
        createdAt: new Date().toISOString(),
        downloadUrl: `/backup/download/${filename}`,
      };
    } catch (error) {
      console.error('Backup failed:', error);
      throw new Error('Backup creation failed');
    } finally {
      delete process.env.PGPASSWORD;
    }
  }

  async listBackups(userId: number, userRole: string): Promise<BackupFile[]> {
    if (userRole !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can list backups');
    }

    if (!fs.existsSync(this.backupDir)) {
      return [];
    }

    const files = fs.readdirSync(this.backupDir);
    const backups: BackupFile[] = [];

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const stats = fs.statSync(path.join(this.backupDir, file));
        backups.push({
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          downloadUrl: `/backup/download/${file}`,
        });
      }
    }

    return backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async downloadBackup(filename: string, userId: number, userRole: string) {
    if (userRole !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can download backups');
    }

    const filepath = path.join(this.backupDir, filename);
    
    if (!filepath.startsWith(this.backupDir)) {
      throw new ForbiddenException('Invalid filename');
    }

    if (!fs.existsSync(filepath)) {
      throw new Error('Backup file not found');
    }

    return {
      filepath,
      filename,
    };
  }

  async deleteBackup(filename: string, userId: number, userRole: string) {
    if (userRole !== 'superadmin') {
      throw new ForbiddenException('Only superadmin can delete backups');
    }

    const filepath = path.join(this.backupDir, filename);
    
    if (!filepath.startsWith(this.backupDir)) {
      throw new ForbiddenException('Invalid filename');
    }

    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { success: true, message: 'Backup deleted successfully' };
    }

    throw new Error('Backup file not found');
  }
}
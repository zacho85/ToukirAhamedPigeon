// kongossa-backend/src/backup/backup.controller.ts
import { Controller, Get, Post, Delete, Param, Res, UseGuards, Req } from '@nestjs/common'; 
import type { Response } from 'express';
import { BackupService, type BackupFile } from './backup.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('backup')
@UseGuards(JwtAuthGuard)
export class BackupController {
  constructor(private backupService: BackupService) {}

  @Post('create')
  async createBackup(@Req() req: any) {
    return this.backupService.createBackup(req.user.userId, req.user.role);
  }

  @Get('list')
  async listBackups(@Req() req: any): Promise<BackupFile[]> {
    return this.backupService.listBackups(req.user.userId, req.user.role);
  }

  @Get('download/:filename')
  async downloadBackup(
    @Param('filename') filename: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { filepath, filename: safeFilename } = await this.backupService.downloadBackup(
      filename,
      req.user.userId,
      req.user.role,
    );
    
    res.download(filepath, safeFilename);
  }

  @Delete(':filename')
  async deleteBackup(@Param('filename') filename: string, @Req() req: any) {
    return this.backupService.deleteBackup(filename, req.user.userId, req.user.role);
  }
}
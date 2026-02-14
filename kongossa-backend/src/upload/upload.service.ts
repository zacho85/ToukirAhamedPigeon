import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

@Injectable()
export class UploadService {
  private uploadDir = path.join(process.cwd(), 'uploads'); // project root

  async saveFile(file: Express.Multer.File, type: string): Promise<string> {
    const folder = path.join(this.uploadDir, type);
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });

    const filePath = path.join(folder, file.originalname);
    console.log('Saving file to:', filePath);

    // Resize if image
    if (file.mimetype.startsWith('image/')) {
      await sharp(file.buffer)
        .resize(800, 800, { fit: 'inside' })
        .toFile(filePath);
    } else {
      if (!file.buffer) throw new Error('File buffer is empty!');
      fs.writeFileSync(filePath, file.buffer);
    }

    return `/uploads/${type}/${file.originalname}`;
  }
}


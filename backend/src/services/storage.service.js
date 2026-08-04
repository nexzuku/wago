import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class StorageService {
  constructor() {
    // Anchored to the backend package root, NOT process.cwd(): app.js serves
    // this exact directory, so deriving it from the working directory meant
    // uploads silently landed somewhere unserved unless you happened to start
    // the server from backend/.
    this.uploadDir = path.resolve(__dirname, '../../uploads');
  }

  async ensureDir(dir) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async saveFile(buffer, originalName, folder = 'general') {
    const folderPath = path.join(this.uploadDir, folder);
    await this.ensureDir(folderPath);

    const ext = path.extname(originalName);
    const filename = `${uuidv4()}${ext}`;
    const filePath = path.join(folderPath, filename);

    await fs.writeFile(filePath, buffer);

    return {
      filename,
      path: filePath,
      url: `/uploads/${folder}/${filename}`,
      size: buffer.length
    };
  }

  async saveAudio(buffer, originalName, companyId) {
    return this.saveFile(buffer, originalName, `audio/${companyId}`);
  }

  async saveVoiceSample(buffer, originalName, companyId) {
    return this.saveFile(buffer, originalName, `voice-samples/${companyId}`);
  }

  async saveContent(buffer, originalName, companyId) {
    return this.saveFile(buffer, originalName, `content/${companyId}`);
  }

  async saveLogo(buffer, originalName, companyId) {
    return this.saveFile(buffer, originalName, `logos/${companyId}`);
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async getFile(filePath) {
    return fs.readFile(filePath);
  }

  getFullPath(relativePath) {
    return path.join(this.uploadDir, relativePath.replace('/uploads/', ''));
  }
}

export default new StorageService();

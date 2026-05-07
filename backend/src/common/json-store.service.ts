import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class JsonStoreService {
  private readonly logger = new Logger(JsonStoreService.name);
  
  // Base path moves up from 'src/common' to the root where 'DataStore' lives
  private readonly baseDir = path.join(process.cwd(), 'DataStore');

  constructor() {
    // Ensure the DataStore directory exists on startup
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  private getFilePath(fileName: string): string {
    return path.join(this.baseDir, `${fileName}.json`);
  }

  /**
   * Loads data from a JSON file
   */
  loadData<T = any>(fileName: string): T[] {
    const filePath = this.getFilePath(fileName);
    try {
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]));
        return [];
      }
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data || '[]') as T[];
    } catch (error) {
      this.logger.error(`Error reading ${fileName}:`, error);
      return [];
    }
  }

  /**
   * Saves data to a JSON file
   */
  saveData<T = any>(fileName: string, data: T[]): void {
    const filePath = this.getFilePath(fileName);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
      this.logger.error(`Error saving ${fileName}:`, error);
    }
  }
}
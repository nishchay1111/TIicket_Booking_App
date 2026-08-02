import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Service providing synchronous file-system read and write interactions 
 * acting as a lightweight, JSON-backed local document persistence layer.
 */
@Injectable()
export class JsonStoreService {
  private readonly logger = new Logger(JsonStoreService.name);
  
  private readonly baseDir = path.join(process.cwd(), 'DataStore');

  constructor() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Resolves the absolute disk path for a target data collection file.
   * @param fileName - The name of the target database collection without the file extension.
   * @returns The complete operating system resolved absolute file path string.
   */
  private getFilePath(fileName: string): string {
    return path.join(this.baseDir, `${fileName}.json`);
  }

  /**
   * Reads data entries from the designated local collection file.
   * Generates a blank array database structure if the physical file does not exist.
   * @template T - The structural data type mapping expected for the collection elements.
   * @param fileName - The name of the target database collection file.
   * @returns An array containing the parsed data models or an empty collection on failure.
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
   * Serializes and writes a data array ledger directly onto the local file disk.
   * @template T - The structural data type mapping for the dataset elements.
   * @param fileName - The target collection identification key.
   * @param data - The structural data collection array payload to persist.
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
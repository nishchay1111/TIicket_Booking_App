import fs from 'fs';
import path from 'path';

// Helper to get the correct path to the data folder
const getDataPath = (fileName: string): string => 
    path.join(__dirname, 'DataStore', `${fileName}.json`);

/**
 * Loads data from a JSON file
 */
export const loadData = <T = any>(fileName: string): T[] => {
    const filePath = getDataPath(fileName);
    try {
        if (!fs.existsSync(filePath)) {
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(filePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]') as T[];
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
};

/**
 * Saves data to a JSON file
 */
export const saveData = <T = any>(fileName: string, data: T[]): void => {
    const filePath = getDataPath(fileName);
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(`Error saving ${fileName}:`, error);
    }
};
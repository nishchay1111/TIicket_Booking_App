const fs = require('fs');
const path = require('path');

// Helper to get the correct path to the data folder
const getDataPath = (fileName) => path.join(__dirname, 'DataStore', `${fileName}.json`);

/**
 * Loads data from a JSON file
 * @param {string} fileName - Name of the file (e.g., 'users', 'events')
 * @returns {Array} - The parsed data array
 */
const loadData = (fileName) => {
    const filePath = getDataPath(fileName);
    try {
        if (!fs.existsSync(filePath)) {
            // If file doesn't exist, return empty array and create the file
            fs.writeFileSync(filePath, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (error) {
        console.error(`Error reading ${fileName}:`, error);
        return [];
    }
};

/**
 * Saves data to a JSON file
 * @param {string} fileName - Name of the file
 * @param {Array} data - The array to save
 */
const saveData = (fileName, data) => {
    const filePath = getDataPath(fileName);
    try {
        // Ensure the directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (error) {
        console.error(`Error saving ${fileName}:`, error);
    }
};

module.exports = { loadData, saveData };
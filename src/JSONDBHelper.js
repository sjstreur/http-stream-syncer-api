const fs = require('fs');
const { parse } = require('path');

module.exports = class JSONDBHelper {
    pathToJson = '';
    
    constructor(pathToJson) {
        this.pathToJson = pathToJson;
    }
    
    async initDB() {
        try {
            await fs.promises.readFile(this.pathToJson);
        } catch (err) {
            if (err.code === 'ENOENT') {
                try {
                    await this._createDBFile();
                } catch (error) {
                    return new Error(error);
                }
            } else {
                return new Error(`Could not initiate DB`);
            }
        }

        return true;
    }
    
    async upsertProperty(property = null, value = null) {
        if (property === null || value === null) return new Error('Change requires property and value to be given');

        let data;

        try {
            data = await this.getData();
        } catch (error) {
            return new Error(error);
        }

        data[property] = value;

        try {
            await fs.promises.writeFile(this.pathToJson, JSON.stringify(data), null);
        } catch {
            return new Error('Data update could not be saved to db');
        }

        return;
    }
    
    async getData(property = null) {
        let data;
        let parsedData;

        try {
            data = await fs.promises.readFile(this.pathToJson, { encoding: 'utf8' });
        } catch (error) {
            return new Error('Could not read DB file');
        }

        if (!data) return new Error('Could not read DB file');

        try {
            parsedData = JSON.parse(data);
        } catch (error) {
            return new Error('Something is wrong with the JSON format');
        }

        if (property !== null) {
            return parsedData[property];
        }

        return parsedData;
    }
    
    async _createDBFile() {
        try {
            await fs.promises.writeFile(this.pathToJson, JSON.stringify({}));
        } catch (error) {
            return new Error('Could not create DB file');
        }
    }
}
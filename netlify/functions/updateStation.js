const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { stationName } = JSON.parse(event.body);
    const filePath = path.join(__dirname, '..', 'station.txt'); // Path to station.txt

    try {
        // Write the new station name to station.txt
        fs.writeFileSync(filePath, stationName);

        return { statusCode: 200, body: 'Station name updated successfully!' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Failed to update station name.' };
    }
};

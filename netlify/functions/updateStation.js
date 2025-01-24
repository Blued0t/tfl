// netlify/functions/updateStation.js
const axios = require('axios');

exports.handler = async (event) => {
  try {
    // Parse the request body
    const { stationName } = JSON.parse(event.body);

    // GitHub API details
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Store your GitHub token in Netlify's environment variables
    const REPO_OWNER = 'Blued0t'; // Replace with your GitHub username
    const REPO_NAME = 'tfl'; // Replace with your repository name
    const FILE_PATH = 'station.txt'; // Path to the file in your repository

    // Get the current file SHA (required for updating the file)
    const getFileResponse = await axios.get(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    const sha = getFileResponse.data.sha;

    // Update the file
    await axios.put(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        message: 'Update station name', // Commit message
        content: Buffer.from(stationName).toString('base64'), // Encode content as base64
        sha: sha, // Include the SHA to update the file
      },
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
        },
      }
    );

    // (Optional) Trigger a Netlify build
    const NETLIFY_TOKEN = process.env.NETLIFY_TOKEN; // Store your Netlify token in Netlify's environment variables
    const NETLIFY_SITE_ID = process.env.NETLIFY_SITE_ID; // Store your Netlify site ID in Netlify's environment variables

    await axios.post(
      `https://api.netlify.com/api/v1/sites/${NETLIFY_SITE_ID}/builds`,
      {},
      {
        headers: {
          Authorization: `Bearer ${NETLIFY_TOKEN}`,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Station name updated successfully!' }),
    };
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to update station name.' }),
    };
  }
};

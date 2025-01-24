const fetch = require('node-fetch');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { stationName } = JSON.parse(event.body);
    const githubToken = process.env.GITHUB_TOKEN; // Store your GitHub token in Netlify environment variables
    const repoOwner = 'Blued0t'; // Replace with your GitHub username
    const repoName = 'tfl'; // Replace with your repository name
    const filePath = 'station.txt'; // Path to the file in the repository
    const commitMessage = 'Update station.txt'; // Commit message

    // Get the current SHA of the file
    const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
    const fileResponse = await fetch(apiUrl, {
        headers: {
            Authorization: `token ${githubToken}`,
            'User-Agent': 'Netlify Function',
        },
    });

    if (!fileResponse.ok) {
        return { statusCode: fileResponse.status, body: 'Failed to fetch file info' };
    }

    const fileInfo = await fileResponse.json();
    const sha = fileInfo.sha;

    // Update the file
    const updateResponse = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            Authorization: `token ${githubToken}`,
            'User-Agent': 'Netlify Function',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(stationName).toString('base64'),
            sha: sha,
        }),
    });

    if (!updateResponse.ok) {
        return { statusCode: updateResponse.status, body: 'Failed to update file' };
    }

    return { statusCode: 200, body: 'File updated successfully!' };
};

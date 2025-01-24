const fetch = require('node-fetch');

const gitlabToken = process.env.GITLAB_TOKEN; // Store your GitLab token in Netlify environment variables
const repoOwner = 'your-username'; // Replace with your GitLab username
const repoName = 'your-repo-name'; // Replace with your repository name
const filePath = 'station.txt';
const branch = 'main';

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { stationName } = JSON.parse(event.body);

    try {
        // Get the current file info
        const fileUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${repoOwner}/${repoName}`)}/repository/files/${encodeURIComponent(filePath)}?ref=${branch}`;
        const fileResponse = await fetch(fileUrl, {
            headers: {
                'PRIVATE-TOKEN': gitlabToken,
            },
        });

        if (!fileResponse.ok) {
            console.error('Failed to fetch file info:', await fileResponse.text());
            return { statusCode: fileResponse.status, body: 'Failed to fetch file info' };
        }

        const fileInfo = await fileResponse.json();
        const sha = fileInfo.sha;

        // Update the file
        const updateUrl = `https://gitlab.com/api/v4/projects/${encodeURIComponent(`${repoOwner}/${repoName}`)}/repository/files/${encodeURIComponent(filePath)}`;
        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'PRIVATE-TOKEN': gitlabToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                branch: branch,
                content: Buffer.from(stationName).toString('base64'),
                commit_message: 'Update station.txt',
                sha: sha,
            }),
        });

        if (!updateResponse.ok) {
            console.error('Failed to update file:', await updateResponse.text());
            return { statusCode: updateResponse.status, body: 'Failed to update file' };
        }

        return { statusCode: 200, body: 'Station name updated successfully!' };
    } catch (error) {
        console.error('Error:', error);
        return { statusCode: 500, body: 'Failed to update station name.' };
    }
};

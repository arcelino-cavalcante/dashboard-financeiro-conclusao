// Handles saving/loading from a GitHub repository using the GitHub REST API.

let currentSha = null; // We need the SHA to update an existing file

/**
 * Fetch data.json from the repository
 */
async function fetchFromGithub(config) {
    const { repo, branch, token } = config;
    const url = `https://api.github.com/repos/${repo}/contents/data.json?ref=${branch}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (response.status === 404) {
            // File doesn't exist yet, we will create it later
            console.log("data.json not found in repo. It will be created on the next save.");
            return null;
        }

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        currentSha = data.sha; // Save SHA for updates

        // Content is base64 encoded
        // Use decodeURIComponent(escape(atob())) to handle UTF-8 chars correctly
        const contentStr = decodeURIComponent(escape(atob(data.content)));
        return JSON.parse(contentStr);

    } catch (error) {
        console.error("Error fetching from GitHub:", error);
        throw error;
    }
}

/**
 * Save data.json to the repository
 */
async function saveToGithub(config, appData) {
    const { repo, branch, token } = config;
    const url = `https://api.github.com/repos/${repo}/contents/data.json`;
    
    // Create base64 encoded string from data, handling UTF-8
    const contentStr = JSON.stringify(appData, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(contentStr)));

    const body = {
        message: `Auto-save dashboard data ${new Date().toISOString()}`,
        content: encodedContent,
        branch: branch
    };

    if (currentSha) {
        body.sha = currentSha;
    }

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`GitHub API Error: ${response.status} ${response.statusText}`);
        }

        const responseData = await response.json();
        currentSha = responseData.content.sha; // Update SHA for next save

        return true;
    } catch (error) {
        console.error("Error saving to GitHub:", error);
        throw error;
    }
}

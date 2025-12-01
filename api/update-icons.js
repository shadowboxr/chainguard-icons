// API route: /api/update-icons.js
// Updates the icon data by committing to GitHub

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { allIcons, chainguardSpecific, password } = req.body;

    // Verify admin password
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate data
    if (!allIcons || !chainguardSpecific) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    // Prepare the updated data
    const iconsData = {
      allIcons,
      chainguardSpecific,
      lastUpdated: new Date().toISOString()
    };

    // GitHub API details
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;
    const filePath = 'data/icons.json';

    // Get current file SHA
    const fileUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const fileResponse = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha;
    if (fileResponse.ok) {
      const fileData = await fileResponse.json();
      sha = fileData.sha;
    }

    // Commit the updated file
    const updateUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
    const updateResponse = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Update icon data via admin panel',
        content: Buffer.from(JSON.stringify(iconsData, null, 2)).toString('base64'),
        sha: sha,
        branch: branch
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json();
      throw new Error(`GitHub API error: ${errorData.message}`);
    }

    const result = await updateResponse.json();

    return res.status(200).json({ 
      success: true, 
      message: 'Icons updated successfully',
      commit: result.commit.sha
    });
  } catch (error) {
    console.error('Error updating icons:', error);
    return res.status(500).json({ 
      error: 'Failed to update icons',
      message: error.message 
    });
  }
}

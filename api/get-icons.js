// API route: /api/get-icons.js
// Fetches the current icon data from the repository

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch the icons.json file from the GitHub API (not raw - avoids CDN cache)
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const token = process.env.GITHUB_TOKEN;
    
    // Use GitHub API instead of raw endpoint to avoid caching
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/data/icons.json?ref=${branch}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/vnd.github.v3+json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch icons data: ${response.statusText}`);
    }

    const fileData = await response.json();
    
    // Decode the base64 content
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const data = JSON.parse(content);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching icons:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch icons data',
      message: error.message 
    });
  }
}
